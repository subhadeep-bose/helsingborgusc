import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Pencil } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface ScheduleEntry {
  id: string;
  day: string;
  time: string;
  type: string;
  location: string;
  category: string;
  event_date: string | null;
  sort_order: number;
}

const AdminSchedule = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ day: "", time: "", type: "", location: "", category: "weekly", event_date: "", sort_order: 0 });
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = async () => {
    const { data } = await supabase.from("schedule_entries").select("*").order("category").order("sort_order");
    setEntries(data ?? []);
    setFetching(false);
  };

  useEffect(() => { if (isAdmin) fetchEntries(); }, [isAdmin]);

  const resetForm = () => {
    setForm({ day: "", time: "", type: "", location: "", category: "weekly", event_date: "", sort_order: 0 });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type.trim() || !form.location.trim()) {
      toast({ title: "Type and location are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const payload = {
      day: form.day.trim(),
      time: form.time.trim(),
      type: form.type.trim(),
      location: form.location.trim(),
      category: form.category,
      event_date: form.category === "event" && form.event_date ? form.event_date : null,
      sort_order: form.sort_order,
    };
    if (editId) {
      const { error } = await supabase.from("schedule_entries").update(payload).eq("id", editId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Updated!" });
    } else {
      const { error } = await supabase.from("schedule_entries").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Added!" });
    }
    setSubmitting(false);
    resetForm();
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("schedule_entries").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchEntries(); }
  };

  const startEdit = (e: ScheduleEntry) => {
    setEditId(e.id);
    setForm({ day: e.day, time: e.time, type: e.type, location: e.location, category: e.category, event_date: e.event_date ?? "", sort_order: e.sort_order });
    setShowForm(true);
  };

  const weekly = entries.filter(e => e.category === "weekly");
  const events = entries.filter(e => e.category === "event");

  return (
    <AdminLayout
      title="Schedule"
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
          {events.map(e => (
            <div key={e.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-foreground">{e.type}</p>
                <p className="text-sm text-muted-foreground">{e.event_date} · {e.location}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(e)} className="p-2 rounded hover:bg-muted transition"><Pencil size={16} className="text-muted-foreground" /></button>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded hover:bg-destructive/10 transition"><Trash2 size={16} className="text-destructive" /></button>
              </div>
            </div>
          ))}
        </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
