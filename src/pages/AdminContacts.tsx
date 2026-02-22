import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Mail, Clock, Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const AdminContacts = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setFetching(false);
  };

  useEffect(() => {
    if (isAdmin) fetchMessages();
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this message permanently?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Deleted" });
      fetchMessages();
    }
  };

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Contact" accent="Messages" loading={fetching} maxWidth="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 max-w-md">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            {search ? "No messages match your search." : "No contact messages yet."}
          </p>
        )}
        {filtered.map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <div
              className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/20 transition"
              onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-display text-lg text-foreground">{m.subject}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {m.name} ({m.email})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(m.created_at).toLocaleDateString("sv-SE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(m.id);
                }}
                className="p-2 rounded hover:bg-destructive/10 transition shrink-0"
                aria-label="Delete message"
              >
                <Trash2 size={16} className="text-destructive" />
              </button>
            </div>
            {expandedId === m.id && (
              <div className="px-5 pb-5 border-t border-border pt-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{m.message}</p>
                <div className="mt-3">
                  <a
                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-display tracking-wider uppercase text-primary hover:underline"
                  >
                    <Mail size={12} /> Reply via email
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;
