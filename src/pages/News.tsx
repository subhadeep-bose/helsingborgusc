import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Clock, Search } from "lucide-react";
import SEO from "@/components/SEO";
import { useAnnouncements } from "@/hooks/queries";

const News = () => {
  const { data: news = [], isLoading: loading } = useAnnouncements();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tags = [...new Set(news.map((n) => n.tag))];

  const filtered = news.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q);
    const matchesTag = !selectedTag || item.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div>
      <SEO title="News & Announcements" description="Latest news and announcements from Helsingborg United Sports Club." path="/news" />
      <PageHeader title="News & Announcements" subtitle="Stay up to date with the club" />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Search + tag filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 flex-1">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {tags.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded text-xs font-display tracking-wider uppercase transition ${
                  !selectedTag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded text-xs font-display tracking-wider uppercase transition ${
                    selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-32" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {search || selectedTag ? "No announcements match your filter." : "No announcements yet."}
          </p>
        ) : (
          <div className="space-y-6">
            {filtered.map((item) => (
              <article key={item.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-display uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded">
                    {item.tag}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {new Date(item.published_at).toLocaleDateString("sv-SE", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="font-display text-xl text-foreground mb-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.summary}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
