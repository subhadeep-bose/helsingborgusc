import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    // Check if user is a registered member AND a board member
    const checkAccess = async () => {
      // 1. Check membership
      const { data: member } = await supabase
        .from("members")
        .select("id, status, user_id")
        .eq("email", user.email ?? "")
        .maybeSingle();

      if (!member) {
        toast({
          title: "Access denied",
          description: "You must be a registered member to log in. Please register first.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      if (member.status !== "approved") {
        toast({
          title: "Pending approval",
          description: "Your membership is still pending admin approval.",
          variant: "destructive",
        });
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

      // 3. Check board membership
      const { data: boardMember } = await supabase
        .from("board_members")
        .select("id, user_id, member_id")
        .eq("member_id", member.id)
        .maybeSingle();

      if (!boardMember) {
        toast({
          title: "Access restricted",
          description: "Only board members can log in to the management area.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      // 4. Link user_id to board_member record if not already linked
      if (!boardMember.user_id) {
        await supabase
          .from("board_members")
          .update({ user_id: user.id })
          .eq("id", boardMember.id);
      }

      navigate("/", { replace: true });
    };
    checkAccess();
  }, [user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast({ title: "Validation Error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);

    if (isLogin) {
      // Check membership + board membership before attempting login
      const { data: member } = await supabase
        .from("members")
        .select("id, status")
        .eq("email", email.trim())
        .maybeSingle();
      if (!member) {
        toast({
          title: "Access denied",
          description: "You must be a registered member to log in. Please register first via the Join Us page.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      if (member.status !== "approved") {
        toast({
          title: "Pending approval",
          description: "Your membership is still pending admin approval. Please wait for confirmation.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Check board membership by member_id
      const { data: boardMember } = await supabase
        .from("board_members")
        .select("id")
        .eq("member_id", member.id)
        .maybeSingle();
      if (!boardMember) {
        toast({
          title: "Access restricted",
          description: "Only board members can log in. Contact the club administration if you believe this is an error.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      const { error } = await signUp(email, password);
      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created", description: "Check your email to confirm your account." });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-20">
      <SEO title="Board Login" description="Sign in to the Helsingborg United SC management area." path="/auth" />
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-sm">
        <h1 className="font-display text-3xl text-foreground text-center tracking-wide mb-2">
          {isLogin ? "Board Login" : "Create Account"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {isLogin ? "Sign in to manage the club (board members only)" : "Register a new board account"}
        </p>
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
      </div>
    </div>
  );
};

export default Auth;
