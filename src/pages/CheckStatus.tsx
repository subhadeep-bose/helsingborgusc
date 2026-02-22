import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Search, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import SEO from "@/components/SEO";

const statusConfig = {
  approved: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", label: "Approved", description: "Your membership has been approved! You can now sign in and access club features." },
  pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "Pending Review", description: "Your application is being reviewed by the board. We'll update you soon." },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Not Approved", description: "Unfortunately your application was not approved. Please contact us for more information." },
};

const CheckStatus = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ status: string; name: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setChecking(true);
    setResult(null);
    setNotFound(false);

    const { data } = await supabase
      .from("members")
      .select("first_name, last_name, status")
      .eq("email", trimmed)
      .maybeSingle();

    setChecking(false);
    if (data) {
      setResult({
        status: data.status,
        name: `${data.first_name} ${data.last_name ?? ""}`.trim(),
      });
    } else {
      setNotFound(true);
    }
  };

  const cfg = result ? statusConfig[result.status as keyof typeof statusConfig] : null;

  return (
    <div>
      <SEO title="Check Application Status" description="Check the status of your membership application at Helsingborg United SC." path="/check-status" />
      <PageHeader title="Check Status" subtitle="Look up your membership application" />
      <div className="container mx-auto px-4 py-16 max-w-md">
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email you registered with"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
          <button
            type="submit"
            disabled={checking}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase py-3 rounded hover:brightness-110 transition disabled:opacity-50"
          >
            <Search size={16} /> {checking ? "Checking…" : "Check Status"}
          </button>
        </form>

        {result && cfg && (
          <div className={`mt-8 ${cfg.bg} border border-border rounded-lg p-6 text-center`}>
            <cfg.icon size={40} className={`${cfg.color} mx-auto mb-3`} />
            <p className="text-sm text-muted-foreground mb-1">Hello, {result.name}!</p>
            <p className={`font-display text-xl ${cfg.color} tracking-wide`}>{cfg.label}</p>
            <p className="text-sm text-muted-foreground mt-2">{cfg.description}</p>
          </div>
        )}

        {notFound && (
          <div className="mt-8 bg-muted/50 border border-border rounded-lg p-6 text-center">
            <AlertCircle size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-display text-lg text-foreground">Not Found</p>
            <p className="text-sm text-muted-foreground mt-2">
              No application found for that email. Make sure you entered the same email you used to register.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckStatus;
