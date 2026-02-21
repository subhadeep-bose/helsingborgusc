import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

interface BoardMember {
  id: string;
  name: string;
  role: string;
}

const Board = () => {
  const [board, setBoard] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("board_members")
      .select("id, name, role")
      .order("sort_order")
      .then(({ data }) => {
        setBoard(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <PageHeader title="Board Members" subtitle="The team behind Helsingborg United SC" />
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
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
