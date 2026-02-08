import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { User } from "lucide-react";

interface Member {
  id: string;
  first_name: string;
  last_name: string | null;
  experience_level: string | null;
  registered_at: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, first_name, last_name, experience_level, registered_at")
        .order("registered_at", { ascending: false });

      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const formatRole = (level: string | null) => {
    if (!level) return "Member";
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div>
      <PageHeader title="Members" subtitle={`${members.length} registered member${members.length !== 1 ? "s" : ""}`} />
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No members yet. Be the first to join!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:shadow-sm transition"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-display text-foreground">
                    {m.first_name} {m.last_name || ""}
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    {formatRole(m.experience_level)} · Joined{" "}
                    {new Date(m.registered_at).toLocaleDateString("en-SE", {
                      year: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
