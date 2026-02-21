import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Shield, ShieldOff, Pencil, X, Check, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Member {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  experience_level: string | null;
  registered_at: string;
  status: string;
  user_id: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminMembers = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", experience_level: "" });
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  const fetchData = async () => {
    const [membersRes, rolesRes] = await Promise.all([
      supabase.from("members").select("id, first_name, last_name, email, phone, experience_level, registered_at, status, user_id").order("registered_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setMembers(membersRes.data ?? []);
    setRoles(rolesRes.data ?? []);
    setFetching(false);
  };

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  const handleDelete = async (id: string) => {
    const member = members.find(m => m.id === id);
    const name = member ? `${member.first_name} ${member.last_name ?? ""}`.trim() : "this member";
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) return;

    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Member removed" }); fetchData(); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("members").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: status === "approved" ? "Member approved!" : "Member rejected" }); fetchData(); }
  };

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEditForm({ first_name: m.first_name, last_name: m.last_name ?? "", experience_level: m.experience_level ?? "" });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("members").update({
      first_name: editForm.first_name,
      last_name: editForm.last_name || null,
      experience_level: editForm.experience_level || null,
    }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated" }); setEditingId(null); fetchData(); }
  };

  const assignAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as const });
    if (error) {
      if (error.code === "23505") toast({ title: "Already an admin" });
      else toast({ title: "Error", description: error.message, variant: "destructive" });
    } else { toast({ title: "Admin role assigned" }); fetchData(); }
  };

  const removeAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Admin role removed" }); fetchData(); }
  };

  const filtered = members.filter(m => m.status === tab);
  const pendingCount = members.filter(m => m.status === "pending").length;

  return (
    <AdminLayout title="Manage" accent="Members" loading={fetching}>

        {/* Role Management */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="font-display text-xl text-foreground mb-4">Admin Role Management</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Assign or remove admin privileges for authenticated users.
          </p>
          <RoleAssigner onAssign={assignAdmin} />
          {roles.filter(r => r.role === "admin").length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Current admins:</p>
              {roles.filter(r => r.role === "admin").map(r => (
                <div key={r.user_id} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2">
                  <code className="text-xs text-muted-foreground break-all">{r.user_id}</code>
                  {r.user_id !== user?.id && (
                    <button onClick={() => removeAdmin(r.user_id)} className="p-1 rounded hover:bg-destructive/10 transition" aria-label="Remove admin">
                      <ShieldOff size={14} className="text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded font-display text-sm tracking-wider uppercase transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t}
              {t === "pending" && pendingCount > 0 && (
                <span className="ml-2 bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Members Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-display text-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-display text-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-display text-foreground">Level</th>
                  <th className="text-left px-4 py-3 font-display text-foreground">Linked</th>
                  <th className="text-left px-4 py-3 font-display text-foreground">Applied</th>
                  <th className="text-right px-4 py-3 font-display text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No {tab} members.</td></tr>
                )}
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition">
                    <td className="px-4 py-3">
                      {editingId === m.id ? (
                        <div className="flex gap-1">
                          <input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} className="w-20 rounded border border-input bg-background px-1.5 py-0.5 text-xs" />
                          <input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} className="w-20 rounded border border-input bg-background px-1.5 py-0.5 text-xs" placeholder="Last" />
                        </div>
                      ) : (
                        <span className="text-foreground">{m.first_name} {m.last_name ?? ""}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-3">
                      {editingId === m.id ? (
                        <input value={editForm.experience_level} onChange={e => setEditForm(p => ({ ...p, experience_level: e.target.value }))} className="w-24 rounded border border-input bg-background px-1.5 py-0.5 text-xs" placeholder="Level" />
                      ) : (
                        <span className="text-muted-foreground">{m.experience_level ?? "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {m.user_id ? (
                        <span className="text-xs text-primary" title={m.user_id}>✓ Auth</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(m.registered_at).toLocaleDateString("sv-SE", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === m.id ? (
                          <>
                            <button onClick={() => saveEdit(m.id)} className="p-1.5 rounded hover:bg-primary/10 transition" aria-label="Save"><Check size={14} className="text-primary" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded hover:bg-muted transition" aria-label="Cancel"><X size={14} className="text-muted-foreground" /></button>
                          </>
                        ) : (
                          <>
                            {m.status === "pending" && (
                              <>
                                <button onClick={() => handleStatusChange(m.id, "approved")} className="p-1.5 rounded hover:bg-primary/10 transition" aria-label="Approve" title="Approve">
                                  <CheckCircle size={16} className="text-primary" />
                                </button>
                                <button onClick={() => handleStatusChange(m.id, "rejected")} className="p-1.5 rounded hover:bg-destructive/10 transition" aria-label="Reject" title="Reject">
                                  <XCircle size={16} className="text-destructive" />
                                </button>
                              </>
                            )}
                            {m.status === "rejected" && (
                              <button onClick={() => handleStatusChange(m.id, "approved")} className="p-1.5 rounded hover:bg-primary/10 transition" aria-label="Approve" title="Approve">
                                <CheckCircle size={16} className="text-primary" />
                              </button>
                            )}
                            {m.status === "approved" && (
                              <button onClick={() => handleStatusChange(m.id, "rejected")} className="p-1.5 rounded hover:bg-destructive/10 transition" aria-label="Reject" title="Revoke">
                                <XCircle size={16} className="text-destructive" />
                              </button>
                            )}
                            <button onClick={() => startEdit(m)} className="p-1.5 rounded hover:bg-muted transition" aria-label="Edit"><Pencil size={14} className="text-muted-foreground" /></button>
                            <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded hover:bg-destructive/10 transition" aria-label="Delete"><Trash2 size={14} className="text-destructive" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </AdminLayout>
  );
};

const RoleAssigner = ({ onAssign }: { onAssign: (userId: string) => void }) => {
  const [userId, setUserId] = useState("");
  return (
    <div className="flex gap-2">
      <input
        value={userId}
        onChange={e => setUserId(e.target.value)}
        placeholder="Paste user ID (UUID)"
        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        onClick={() => { if (userId.trim()) { onAssign(userId.trim()); setUserId(""); } }}
        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-5 py-2 rounded hover:brightness-110 transition"
      >
        <Shield size={14} /> Assign Admin
      </button>
    </div>
  );
};

export default AdminMembers;
