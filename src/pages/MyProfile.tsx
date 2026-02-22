import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import SEO from "@/components/SEO";
import { User, Mail, Phone, Calendar, MapPin, Save, LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMyProfile, useUpdateMember, useDeleteMember } from "@/hooks/queries";

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: loading } = useMyProfile(user?.id);
  const updateMember = useUpdateMember();
  const deleteMemberMutation = useDeleteMember();
  const [form, setForm] = useState({ phone: "", experience_level: "" });
  const saving = updateMember.isPending;

  useEffect(() => {
    if (profile) {
      setForm({ phone: profile.phone ?? "", experience_level: profile.experience_level ?? "" });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      await updateMember.mutateAsync({
        id: profile.id,
        phone: form.phone || null,
        experience_level: form.experience_level || null,
      });
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error("Error saving", { description: err.message });
    }
  };

  const handleWithdraw = async () => {
    if (!profile) return;
    if (!window.confirm("Are you sure you want to withdraw your membership? This action is permanent and cannot be undone.")) return;
    try {
      await deleteMemberMutation.mutateAsync(profile.id);
      toast.success("Membership withdrawn");
      await supabase.auth.signOut();
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const statusColors: Record<string, string> = {
    approved: "bg-primary/10 text-primary",
    pending: "bg-yellow-500/10 text-yellow-600",
    rejected: "bg-destructive/10 text-destructive",
  };

  if (loading) {
    return (
      <div>
        <SEO title="My Profile" description="View and manage your Helsingborg United SC membership." path="/my-profile" />
        <PageHeader title="My Profile" subtitle="Manage your membership" />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <SEO title="My Profile" description="View and manage your Helsingborg United SC membership." path="/my-profile" />
        <PageHeader title="My Profile" subtitle="Manage your membership" />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">No membership record found for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEO title="My Profile" description="View and manage your Helsingborg United SC membership." path="/my-profile" />
      <PageHeader title="My Profile" subtitle="View and manage your membership" />
      <div className="container mx-auto px-4 py-16 max-w-2xl space-y-8">

        {/* Status card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-display text-lg text-foreground">
                {profile.first_name.charAt(0).toUpperCase()}{(profile.last_name ?? "").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl text-foreground">{profile.first_name} {profile.last_name ?? ""}</h2>
              <span className={`text-xs font-display uppercase tracking-wider px-2 py-0.5 rounded ${statusColors[profile.status] ?? "bg-muted text-muted-foreground"}`}>
                {profile.status}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={14} /> {profile.email}
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} /> {profile.phone}
              </div>
            )}
            {profile.date_of_birth && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} /> Born {profile.date_of_birth}
              </div>
            )}
            {profile.place_of_birth && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} /> {profile.place_of_birth}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <User size={14} /> {profile.experience_level ?? "Not set"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} /> Joined {new Date(profile.registered_at).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          {profile.status === "approved" && (
            <div className="mt-3 text-xs">
              <span className={`font-display uppercase tracking-wider px-2 py-0.5 rounded ${profile.fee_paid ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                Fee: {profile.fee_paid ? "Paid" : "Unpaid"}
              </span>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Your phone number"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Experience Level</label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm((p) => ({ ...p, experience_level: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select…</option>
                <option value="beginner">Beginner</option>
                <option value="casual">Casual</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-6 py-2 rounded hover:brightness-110 transition disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-display text-sm tracking-wider uppercase px-6 py-2 rounded hover:bg-muted transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
          <button
            onClick={handleWithdraw}
            className="inline-flex items-center justify-center gap-2 border border-destructive text-destructive font-display text-sm tracking-wider uppercase px-6 py-2 rounded hover:bg-destructive/10 transition"
          >
            <Trash2 size={16} /> Withdraw Membership
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
