import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { User, Search } from "lucide-react";
import SEO from "@/components/SEO";
import { useApprovedMembers } from "@/hooks/queries";

const experienceLevels = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "casual", label: "Casual" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const Members = () => {
  const { data: members = [], isLoading: loading } = useApprovedMembers();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const formatExperience = (level: string | null) => {
    if (!level) return "Member";
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const name = `${m.first_name} ${m.last_name ?? ""}`.toLowerCase();
    const matchesSearch = !q || name.includes(q);
    const matchesLevel = !levelFilter || m.experience_level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div>
      <SEO title="Members" description="Browse the registered members of Helsingborg United Sports Club." path="/members" />
      <PageHeader title="Members" subtitle={`${members.length} registered member${members.length !== 1 ? "s" : ""}`} />
      <div className="container mx-auto px-4 py-16">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 flex-1">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {experienceLevels.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {search || levelFilter ? "No members match your filter." : "No members yet. Be the first to join!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:shadow-sm transition"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-sm text-foreground">
                    {m.first_name.charAt(0).toUpperCase()}{(m.last_name ?? "").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-display text-foreground">
                    {m.first_name} {m.last_name || ""}
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    {formatExperience(m.experience_level)} · Joined{" "}
                    {new Date(m.registered_at).toLocaleDateString("sv-SE", {
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
