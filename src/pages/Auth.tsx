import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (!user) return;
    // Check if user is a registered & approved member
    const checkAccess = async () => {
      // 1. Check membership
      const { data: member } = await supabase
        .from("members")
        .select("id, status, user_id")
        .eq("email", user.email ?? "")
        .maybeSingle();

      if (!member) {
        toast.error("Access denied", { description: "You must be a registered member to log in. Please register first." });
        await supabase.auth.signOut();
        return;
      }

      if (member.status !== "approved") {
        toast.error("Pending approval", { description: "Your membership is still pending admin approval." });
        await supabase.auth.signOut();
        return;
      }

      // 2. Link user_id to member record if not already linked
      if (!member.user_id) {
        await supabase
          .from("members")
          .update({ user_id: user.id })
          .eq("id", member.id);
      }

      // 3. Link user_id to board_member record if they are one
      const { data: boardMember } = await supabase
        .from("board_members")
        .select("id, user_id, member_id")
        .eq("member_id", member.id)
        .maybeSingle();

      if (boardMember && !boardMember.user_id) {
        await supabase
          .from("board_members")
          .update({ user_id: user.id })
          .eq("id", boardMember.id);
      }

      navigate(redirectTo, { replace: true });
    };
    checkAccess();
  }, [user, navigate, toast]);

  const handlePasswordReset = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Enter your email", { description: "Type the email associated with your account." });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Error", { description: error.message });
    } else {
      toast("Check your email", { description: "If an account exists for that email, you'll receive a password reset link." });
      setForgotMode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error("Validation Error", { description: result.error.errors[0].message });
      return;
    }
    setSubmitting(true);

    if (isLogin) {
      // Sign in first — post-auth useEffect handles membership + board checks
      // (Pre-login checks removed: RLS hides non-approved members from anon,
      //  causing wrong error messages for pending/rejected members.)
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) {
        toast.error("Error", { description: error.message });
      }
    } else {
      const { error } = await signUp(email, password);
      setSubmitting(false);
      if (error) {
        toast.error("Error", { description: error.message });
      } else {
        toast("Account created", { description: "Check your email to confirm your account." });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-20">
      <SEO title="Member Login" description="Sign in to your Helsingborg United SC account." path="/auth" />
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-sm">
        <h1 className="font-display text-3xl text-foreground text-center tracking-wide mb-2">
          {forgotMode ? "Reset Password" : isLogin ? "Member Login" : "Create Account"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {forgotMode
            ? "Enter your email and we'll send a reset link"
            : isLogin
              ? "Sign in with your member account"
              : "Create a member account"}
        </p>

        {forgotMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase py-3 rounded hover:brightness-110 transition disabled:opacity-50"
            >
              {submitting ? "Please wait…" : "Send Reset Link"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              <button onClick={() => setForgotMode(false)} className="text-primary underline">Back to login</button>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>
              {isLogin && (
                <div className="text-right">
                  <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase py-3 rounded hover:brightness-110 transition disabled:opacity-50"
              >
                {submitting ? "Please wait…" : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary underline">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
