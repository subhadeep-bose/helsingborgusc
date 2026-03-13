import { useState, useMemo } from "react";

import { toast } from "sonner";
import { Trash2, Plus, Pencil, ChevronDown, ChevronUp, Users } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useScheduleEntries, useCreateScheduleEntry, useUpdateScheduleEntry, useDeleteScheduleEntry, useEventRsvpCounts } from "@/hooks/queries";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

/** Fetch member names for a list of user IDs */
function useRsvpAttendeeNames(userIds: string[]) {
  return useQuery({
    queryKey: ["rsvp-attendee-names", ...userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {} as Record<string, string>;
      const { data, error } = await supabase
        .from("members")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIds);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const m of data ?? []) {
        if (m.user_id) {
          map[m.user_id] = [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;
        }
      }
      return map;
    },
    enabled: userIds.length > 0,
  });
}

const AdminSchedule = () => {
  const { data: entries = [], isLoading: fetching } = useScheduleEntries();
  const createMutation = useCreateScheduleEntry();
  const updateMutation = useUpdateScheduleEntry();
  const deleteMutation = useDeleteScheduleEntry();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ day: "", time: "", type: "", location: "", category: "weekly", event_date: "", sort_order: 0 });
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const submitting = createMutation.isPending || updateMutation.isPending;

  const events = useMemo(() => entries.filter(e => e.category === "event"), [entries]);
  const weekly = useMemo(() => entries.filter(e => e.category === "weekly"), [entries]);
  const eventIds = useMemo(() => events.map(e => e.id), [events]);

  const { data: allRsvps = [] } = useEventRsvpCounts(eventIds);

  const rsvpsByEvent = useMemo(() => {
    const map: Record<string, { user_id: string; created_at: string }[]> = {};
    for (const r of allRsvps) {
      if (!map[r.schedule_entry_id]) map[r.schedule_entry_id] = [];
      map[r.schedule_entry_id].push({ user_id: r.user_id, created_at: r.created_at });
    }
    return map;
  }, [allRsvps]);

  const allUserIds = useMemo(() => [...new Set(allRsvps.map(r => r.user_id))], [allRsvps]);
  const { data: nameMap = {} } = useRsvpAttendeeNames(allUserIds);

  const resetForm = () => {
    setForm({ day: "", time: "", type: "", location: "", category: "weekly", event_date: "", sort_order: 0 });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type.trim() || !form.location.trim()) {
      toast.error("Type and location are required");
      return;
    }
    const payload = {
      day: form.day.trim(),
      time: form.time.trim(),
      type: form.type.trim(),
      location: form.location.trim(),
      category: form.category,
      event_date: form.category === "event" && form.event_date ? form.event_date : null,
      sort_order: form.sort_order,
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
    if (!window.confirm("Are you sure you want to delete this schedule entry?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Deleted");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const startEdit = (e: typeof entries[number]) => {
    setEditId(e.id);
    setForm({ day: e.day, time: e.time, type: e.type, location: e.location, category: e.category, event_date: e.event_date ?? "", sort_order: e.sort_order });
    setShowForm(true);
  };

  return (
    <AdminLayout
      title="Manage"
      accent="Schedule"
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="weekly">Weekly Training</option>
                <option value="event">Upcoming Event</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{form.category === "weekly" ? "Type *" : "Event Name *"}</label>
                <input value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location *</label>
                <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
            </div>
            {form.category === "weekly" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Day</label>
                  <input value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} placeholder="e.g. Saturday" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Time</label>
                  <input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="e.g. 10:00 – 12:00" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
            )}
            {form.category === "event" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Event Date</label>
                <input type="date" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            )}
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

        <h2 className="font-display text-xl text-foreground mb-4">Weekly Training</h2>
        <div className="space-y-3 mb-8">
          {weekly.length === 0 && <p className="text-muted-foreground text-center py-4">No weekly entries.</p>}
          {weekly.map(e => (
            <div key={e.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-foreground">{e.type}</p>
                <p className="text-sm text-muted-foreground">{e.day} · {e.time} · {e.location}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(e)} className="p-2 rounded hover:bg-muted transition"><Pencil size={16} className="text-muted-foreground" /></button>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded hover:bg-destructive/10 transition"><Trash2 size={16} className="text-destructive" /></button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-display text-xl text-foreground mb-4">Upcoming Events</h2>
        <div className="space-y-3">
          {events.length === 0 && <p className="text-muted-foreground text-center py-4">No events.</p>}
          {events.map(e => {
            const attendees = rsvpsByEvent[e.id] ?? [];
            const count = attendees.length;
            const isExpanded = expandedEvent === e.id;

            return (
              <div key={e.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-foreground">{e.type}</p>
                    <p className="text-sm text-muted-foreground">{e.event_date} · {e.location}</p>
                  </div>
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : e.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted transition shrink-0"
                    title={`${count} attendee(s)`}
                  >
                    <Users size={14} />
                    <span>{count}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(e)} className="p-2 rounded hover:bg-muted transition"><Pencil size={16} className="text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-2 rounded hover:bg-destructive/10 transition"><Trash2 size={16} className="text-destructive" /></button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-border bg-muted/30 px-4 py-3">
                    {count === 0 ? (
                      <p className="text-sm text-muted-foreground">No RSVPs yet.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {attendees.map((a, i) => (
                          <li key={i} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{nameMap[a.user_id] ?? a.user_id}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(a.created_at).toLocaleDateString("sv-SE")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
