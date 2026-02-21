import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Pencil } from "lucide-react";

interface BoardMember {
  id: string;
  name: string;
  role: string;
  email: string | null;
  bio: string | null;
  sort_order: number;
  member_id: string | null;
  user_id: string | null;
}

interface MemberOption {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
}

const AdminBoard = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "", email: "", bio: "", sort_order: 0, member_id: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/auth", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const fetchMembers = async () => {
    const [boardRes, memberRes] = await Promise.all([
      supabase.from("board_members").select("*").order("sort_order"),
      supabase.from("members").select("id, first_name, last_name, email").eq("status", "approved").order("first_name"),
    ]);
    setMembers(boardRes.data ?? []);
    setMemberOptions(memberRes.data ?? []);
    setFetching(false);
  };

  useEffect(() => { if (isAdmin) fetchMembers(); }, [isAdmin]);

  const resetForm = () => {
    setForm({ name: "", role: "", email: "", bio: "", sort_order: 0, member_id: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast({ title: "Name and role are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim() || null,
      bio: form.bio.trim() || null,
      sort_order: form.sort_order,
      member_id: form.member_id || null,
    };
    if (editId) {
      const { error } = await supabase.from("board_members").update(payload).eq("id", editId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Updated!" });
    } else {
      const { error } = await supabase.from("board_members").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Added!" });
    }
    setSubmitting(false);
    resetForm();
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("board_members").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchMembers(); }
  };

  const startEdit = (m: BoardMember) => {
    setEditId(m.id);
    setForm({ name: m.name, role: m.role, email: m.email ?? "", bio: m.bio ?? "", sort_order: m.sort_order, member_id: m.member_id ?? "" });
    setShowForm(true);
  };

  if (loading || fetching) {
    return <div className="min-h-screen flex items-center justify-center pt-20 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-foreground tracking-wide">
            Manage <span className="gold-accent">Board</span>
          </h1>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-5 py-2 rounded hover:brightness-110 transition">
            <Plus size={16} /> New
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role *</label>
                <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Link to Member</label>
              <select
                value={form.member_id}
                onChange={e => {
                  const selectedMember = memberOptions.find(mo => mo.id === e.target.value);
                  setForm(p => ({
                    ...p,
                    member_id: e.target.value,
                    ...(selectedMember ? {
                      name: `${selectedMember.first_name} ${selectedMember.last_name ?? ""}`.trim(),
                      email: selectedMember.email,
                    } : {}),
                  }));
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— No linked member —</option>
                {memberOptions.map(mo => (
                  <option key={mo.id} value={mo.id}>
                    {mo.first_name} {mo.last_name ?? ""} ({mo.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Linking a member shares the same identity across members, board, and auth.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-6 py-2 rounded hover:brightness-110 transition disabled:opacity-50">
                {submitting ? "Saving…" : editId ? "Update" : "Add"}
              </button>
              <button type="button" onClick={resetForm} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {members.length === 0 && <p className="text-muted-foreground text-center py-8">No board members yet.</p>}
          {members.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-foreground">{m.name}</h3>
                <p className="text-sm gold-accent font-display">{m.role}</p>
                {m.bio && <p className="text-sm text-muted-foreground mt-1">{m.bio}</p>}
                {m.member_id && (
                  <p className="text-xs text-primary/70 mt-1 flex items-center gap-1">
                    ✓ Linked to member
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(m)} className="p-2 rounded hover:bg-muted transition"><Pencil size={16} className="text-muted-foreground" /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 rounded hover:bg-destructive/10 transition"><Trash2 size={16} className="text-destructive" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBoard;
