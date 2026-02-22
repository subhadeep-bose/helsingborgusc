import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";
import { z } from "zod";
import AdminLayout from "@/components/AdminLayout";
import { useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from "@/hooks/queries";

const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().trim().min(1, "Summary is required").max(1000),
  tag: z.string().trim().min(1, "Tag is required").max(50),
});

const AdminAnnouncements = () => {
  const { user, isAdmin } = useAuth();
  const { data: announcements = [], isLoading: fetching } = useAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tag, setTag] = useState("Club News");
  const submitting = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setTag("Club News");
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = announcementSchema.safeParse({ title, summary, tag });
    if (!result.success) {
      toast.error("Validation Error", { description: result.error.errors[0].message });
      return;
    }
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...result.data });
        toast.success("Updated!");
      } else {
        await createMutation.mutateAsync({ ...result.data, created_by: user!.id });
        toast.success("Published!");
      }
      resetForm();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Deleted");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const startEdit = (a: Announcement) => {
    setEditId(a.id);
    setTitle(a.title);
    setSummary(a.summary);
    setTag(a.tag);
    setShowForm(true);
  };

  if (!isAdmin) return null;

  return (
    <AdminLayout
      title="Manage"
      accent="Announcements"
      loading={fetching}
      maxWidth="max-w-3xl"
      headerAction={
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-5 py-2 rounded hover:brightness-110 transition"
        >
          <Plus size={16} /> New
        </button>
      }
    >

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tag</label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-6 py-2 rounded hover:brightness-110 transition disabled:opacity-50"
              >
                {submitting ? "Saving…" : editId ? "Update" : "Publish"}
              </button>
              <button type="button" onClick={resetForm} className="text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {announcements.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No announcements yet.</p>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-display uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {a.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.published_at).toLocaleDateString("sv-SE", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <h3 className="font-display text-lg text-foreground">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{a.summary}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(a)} className="p-2 rounded hover:bg-muted transition" aria-label="Edit">
                  <Pencil size={16} className="text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-2 rounded hover:bg-destructive/10 transition" aria-label="Delete">
                  <Trash2 size={16} className="text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
