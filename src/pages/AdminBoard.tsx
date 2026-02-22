import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Search, ChevronDown, Users, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useBoardMembers, useCreateBoardMember, useUpdateBoardMember, useDeleteBoardMember, useAllMembers } from "@/hooks/queries";
import type { BoardMember } from "@/hooks/queries";

interface MemberOption {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
}

const AdminBoard = () => {
  const { isAdmin } = useAuth();
  const { data: members = [], isLoading: fetching } = useBoardMembers();
  const { data: allMembers = [] } = useAllMembers(isAdmin);
  const memberOptions: MemberOption[] = allMembers
    .filter(m => m.status === "approved")
    .map(m => ({ id: m.id, first_name: m.first_name, last_name: m.last_name, email: m.email }));
  const createMutation = useCreateBoardMember();
  const updateMutation = useUpdateBoardMember();
  const deleteMutation = useDeleteBoardMember();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "", sort_order: 0, member_id: "" });
  const submitting = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setForm({ name: "", role: "", sort_order: 0, member_id: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Name and role are required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      sort_order: form.sort_order,
      member_id: form.member_id || null,
    };
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...payload });
        toast.success("Updated!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Added!");
      }
      resetForm();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this board member?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Deleted");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const startEdit = (m: BoardMember) => {
    setEditId(m.id);
    setForm({ name: m.name, role: m.role, sort_order: m.sort_order, member_id: m.member_id ?? "" });
    setShowForm(true);
  };

  return (
    <AdminLayout
      title="Manage"
      accent="Board"
      loading={fetching}
      maxWidth="max-w-3xl"
      headerAction={
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-5 py-2 rounded hover:brightness-110 transition">
          <Plus size={16} /> New
        </button>
      }
    >

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
              <label className="block text-sm font-medium text-foreground mb-1">Link to Member</label>
              <MemberSelector
                memberOptions={memberOptions}
                boardMembers={members}
                selectedMemberId={form.member_id}
                onSelect={(mo) => {
                  setForm(p => ({
                    ...p,
                    member_id: mo.id,
                    name: `${mo.first_name} ${mo.last_name ?? ""}`.trim(),
                  }));
                }}
                onClear={() => setForm(p => ({ ...p, member_id: "" }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Linking a member shares the same identity across members, board, and auth.</p>
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
    </AdminLayout>
  );
};

/* ───── Searchable Member Dropdown ───── */
const MemberSelector = ({
  memberOptions,
  boardMembers,
  selectedMemberId,
  onSelect,
  onClear,
}: {
  memberOptions: MemberOption[];
  boardMembers: BoardMember[];
  selectedMemberId: string;
  onSelect: (m: MemberOption) => void;
  onClear: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const boardMemberIds = new Set(boardMembers.map(b => b.member_id).filter(Boolean));
  const selectedMember = memberOptions.find(mo => mo.id === selectedMemberId);

  const filtered = memberOptions.filter((mo) => {
    const q = search.toLowerCase();
    const name = `${mo.first_name} ${mo.last_name ?? ""}`.toLowerCase();
    return name.includes(q) || mo.email.toLowerCase().includes(q);
  });

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-lg border border-input bg-background px-4 py-2.5 text-sm hover:border-primary/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {selectedMember ? (
          <span className="flex items-center gap-2 text-foreground">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-display text-foreground">
                {selectedMember.first_name.charAt(0).toUpperCase()}
                {(selectedMember.last_name ?? "").charAt(0).toUpperCase()}
              </span>
            </div>
            {selectedMember.first_name} {selectedMember.last_name ?? ""}
            <span className="text-xs text-muted-foreground">({selectedMember.email})</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Users size={14} className="text-primary" />
            Select a member to link…
          </span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {selectedMember && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-0.5 rounded hover:bg-muted transition"
              aria-label="Clear selection"
            >
              <X size={14} className="text-muted-foreground" />
            </span>
          )}
          <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Dropdown */}
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
              <p className="px-4 py-3 text-sm text-muted-foreground text-center">No matching members</p>
            ) : (
              filtered.map((mo) => {
                const alreadyOnBoard = boardMemberIds.has(mo.id) && mo.id !== selectedMemberId;
                return (
                  <button
                    key={mo.id}
                    type="button"
                    onClick={() => {
                      if (!alreadyOnBoard) {
                        onSelect(mo);
                        setOpen(false);
                        setSearch("");
                      }
                    }}
                    disabled={alreadyOnBoard}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                      alreadyOnBoard
                        ? "opacity-50 cursor-not-allowed"
                        : mo.id === selectedMemberId
                          ? "bg-primary/10"
                          : "hover:bg-primary/5 cursor-pointer"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      mo.id === selectedMemberId ? "bg-primary/20" : "bg-primary/10"
                    }`}>
                      <span className="text-xs font-display text-foreground">
                        {mo.first_name.charAt(0).toUpperCase()}
                        {(mo.last_name ?? "").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">
                        {mo.first_name} {mo.last_name ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{mo.email}</p>
                    </div>
                    {mo.id === selectedMemberId && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-display tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Selected
                      </span>
                    )}
                    {alreadyOnBoard && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-display tracking-wider uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        On board
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
              Members already assigned to a board position are shown but disabled.
              Select a member to auto-fill the name and link their identity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBoard;
