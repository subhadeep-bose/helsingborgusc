import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Shield, ShieldOff, Pencil, X, Check, CheckCircle, XCircle, ChevronDown, Search, Link2, Link2Off, KeyRound, DollarSign } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useAllMembers, useUpdateMember, useDeleteMember, useUserRoles, useAssignRole, useRemoveRole } from "@/hooks/queries";
import type { Member } from "@/hooks/queries";


const AdminMembers = () => {
  const { user, isAdmin } = useAuth();
  const { data: members = [], isLoading: fetching } = useAllMembers(isAdmin);
  const { data: roles = [] } = useUserRoles(isAdmin);
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", experience_level: "" });
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  const handleDelete = async (id: string) => {
    const member = members.find(m => m.id === id);
    const name = member ? `${member.first_name} ${member.last_name ?? ""}`.trim() : "this member";
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) return;
    try {
      await deleteMember.mutateAsync(id);
      toast.success("Member removed");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMember.mutateAsync({ id, status });
      toast.success(status === "approved" ? "Member approved!" : "Member rejected");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEditForm({ first_name: m.first_name, last_name: m.last_name ?? "", experience_level: m.experience_level ?? "" });
  };

  const saveEdit = async (id: string) => {
    try {
      await updateMember.mutateAsync({
        id,
        first_name: editForm.first_name,
        last_name: editForm.last_name || null,
        experience_level: editForm.experience_level || null,
      });
      toast.success("Updated");
      setEditingId(null);
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const handleAssignAdmin = async (userId: string) => {
    try {
      await assignRole.mutateAsync({ user_id: userId, role: "admin" });
      toast.success("Admin role assigned");
    } catch (err: any) {
      if (err.code === "23505") toast.success("Already an admin");
      else toast.error("Error", { description: err.message });
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      await removeRole.mutateAsync({ user_id: userId, role: "admin" });
      toast.success("Admin role removed");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const filtered = members.filter(m => m.status === tab);
  const pendingCount = members.filter(m => m.status === "pending").length;

  return (
    <AdminLayout title="Manage" accent="Members" loading={fetching}>

        {/* Role Management */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="font-display text-xl text-foreground mb-4">Admin Role Management</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Assign or remove admin privileges for authenticated members.
          </p>
          <RoleAssigner
            members={members.filter(m => m.status === "approved")}
            adminUserIds={roles.filter(r => r.role === "admin").map(r => r.user_id)}
            onAssign={handleAssignAdmin}
          />
          {roles.filter(r => r.role === "admin").length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-sm font-medium text-foreground">Current admins:</p>
              {roles.filter(r => r.role === "admin").map(r => {
                const member = members.find(m => m.user_id === r.user_id);
                return (
                  <div key={r.user_id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Shield size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member ? `${member.first_name} ${member.last_name ?? ""}`.trim() : "Unknown user"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member?.email ?? r.user_id}
                        </p>
                      </div>
                    </div>
                    {r.user_id !== user?.id && (
                      <button
                        onClick={() => handleRemoveAdmin(r.user_id)}
                        className="inline-flex items-center gap-1.5 text-xs font-display tracking-wider uppercase text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded transition"
                        aria-label="Remove admin"
                      >
                        <ShieldOff size={13} /> Remove
                      </button>
                    )}
                    {r.user_id === user?.id && (
                      <span className="text-xs text-muted-foreground font-display tracking-wider uppercase">You</span>
                    )}
                  </div>
                );
              })}
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
                  <th className="text-left px-4 py-3 font-display text-foreground">Fee</th>
                  <th className="text-left px-4 py-3 font-display text-foreground">Applied</th>
                  <th className="text-right px-4 py-3 font-display text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No {tab} members.</td></tr>
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
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          try {
                            await updateMember.mutateAsync({ id: m.id, fee_paid: !m.fee_paid });
                          } catch (err: any) {
                            toast.error("Error", { description: err.message });
                          }
                        }}
                        className={`text-xs font-display uppercase tracking-wider px-2 py-0.5 rounded transition ${
                          m.fee_paid
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        }`}
                        title={m.fee_paid ? "Click to mark unpaid" : "Click to mark paid"}
                      >
                        <DollarSign size={12} className="inline -mt-0.5 mr-0.5" />
                        {m.fee_paid ? "Paid" : "Unpaid"}
                      </button>
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

const RoleAssigner = ({
  members,
  adminUserIds,
  onAssign,
}: {
  members: Member[];
  adminUserIds: string[];
  onAssign: (userId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualId, setManualId] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Separate linked (can be made admin) from unlinked
  const nonAdminMembers = members.filter(
    (m) => !m.user_id || !adminUserIds.includes(m.user_id),
  );
  const filtered = nonAdminMembers.filter((m) => {
    const q = search.toLowerCase();
    const name = `${m.first_name} ${m.last_name ?? ""}`.toLowerCase();
    return name.includes(q) || m.email.toLowerCase().includes(q);
  });

  const handleSelect = (m: Member) => {
    if (m.user_id) {
      onAssign(m.user_id);
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Dropdown */}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            Select a member to make admin…
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1.5 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground text-center">
                  No matching members
                </p>
              ) : (
                filtered.map((m) => {
                  const linked = !!m.user_id;
                  const alreadyAdmin =
                    linked && adminUserIds.includes(m.user_id!);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => linked && !alreadyAdmin && handleSelect(m)}
                      disabled={!linked || alreadyAdmin}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                        linked && !alreadyAdmin
                          ? "hover:bg-primary/5 cursor-pointer"
                          : "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          linked ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <span className="text-xs font-display text-foreground">
                          {m.first_name.charAt(0).toUpperCase()}
                          {(m.last_name ?? "").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">
                          {m.first_name} {m.last_name ?? ""}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {m.email}
                        </p>
                      </div>
                      {linked ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-display tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                          <Link2 size={10} /> Linked
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-display tracking-wider uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          <Link2Off size={10} /> No account
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Info bar */}
            <div className="px-4 py-2 border-t border-border bg-muted/30">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Only members with a <strong>linked auth account</strong> (signed in at least once) can be made admin.
                Members showing "No account" need to sign in via the website first.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual UUID fallback */}
      <div>
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <KeyRound size={12} />
          {showManual ? "Hide" : "Or assign by user ID (advanced)"}
        </button>
        {showManual && (
          <div className="flex gap-2 mt-2">
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Paste Supabase Auth user ID (UUID)"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => {
                if (manualId.trim()) {
                  onAssign(manualId.trim());
                  setManualId("");
                }
              }}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-display text-xs tracking-wider uppercase px-4 py-2 rounded hover:brightness-110 transition"
            >
              <Shield size={13} /> Assign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMembers;
