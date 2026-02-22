import PageHeader from "@/components/PageHeader";
import SEO from "@/components/SEO";
import { useBoardMembers } from "@/hooks/queries";

const Board = () => {
  const { data: board = [], isLoading: loading } = useBoardMembers();

  return (
    <div>
      <SEO title="Board Members" description="Meet the board members leading Helsingborg United Sports Club." path="/board" />
      <PageHeader title="Board Members" subtitle="The team behind Helsingborg United SC" />
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-muted mb-4" />
                <div className="h-5 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {board.map((b) => (
              <div
                key={b.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
                  <span className="font-display text-xl text-primary-foreground">
                    {b.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-display text-xl text-foreground">{b.name}</h3>
                <p className="text-sm gold-accent font-display tracking-wide uppercase mt-1">{b.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
