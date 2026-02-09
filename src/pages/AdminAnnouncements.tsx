import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Pencil } from "lucide-react";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().trim().min(1, "Summary is required").max(1000),
  tag: z.string().trim().min(1, "Tag is required").max(50),
});

interface Announcement {
  id: string;
  title: string;
  summary: string;
  tag: string;
  published_at: string;
}

const AdminAnnouncements = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tag, setTag] = useState("Club News");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("id, title, summary, tag, published_at")
      .order("published_at", { ascending: false });
    setAnnouncements(data ?? []);
    setFetching(false);
  };

  useEffect(() => {
    if (isAdmin) fetchAnnouncements();
  }, [isAdmin]);

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
      toast({ title: "Validation Error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    if (editId) {
      const { error } = await supabase
        .from("announcements")
        .update({ title: result.data.title, summary: result.data.summary, tag: result.data.tag })
        .eq("id", editId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Updated!" });
    } else {
      const { error } = await supabase
        .from("announcements")
        .insert({ title: result.data.title, summary: result.data.summary, tag: result.data.tag, created_by: user!.id });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Published!" });
    }
    setSubmitting(false);
    resetForm();
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Deleted" });
      fetchAnnouncements();
    }
  };

  const startEdit = (a: Announcement) => {
    setEditId(a.id);
    setTitle(a.title);
    setSummary(a.summary);
    setTag(a.tag);
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
            Manage <span className="gold-accent">Announcements</span>
          </h1>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-5 py-2 rounded hover:brightness-110 transition"
          >
            <Plus size={16} /> New
          </button>
        </div>

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
                    {new Date(a.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
      </div>
    </div>
  );
};

export default AdminAnnouncements;
