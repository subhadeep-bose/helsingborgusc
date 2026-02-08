import PageHeader from "@/components/PageHeader";
import { User } from "lucide-react";

const members = [
  { name: "Erik Johansson", role: "Batsman", since: "2021" },
  { name: "Amara Syed", role: "All-rounder", since: "2020" },
  { name: "Lars Nilsson", role: "Bowler", since: "2022" },
  { name: "Priya Sharma", role: "Wicketkeeper", since: "2021" },
  { name: "Oscar Lindström", role: "Batsman", since: "2023" },
  { name: "Fatima Hassan", role: "All-rounder", since: "2022" },
  { name: "Björn Ekberg", role: "Bowler", since: "2020" },
  { name: "Ravi Patel", role: "Batsman", since: "2023" },
  { name: "Sofia Bergman", role: "All-rounder", since: "2024" },
  { name: "Ahmed Khan", role: "Bowler", since: "2021" },
  { name: "Maria Gustafsson", role: "Batsman", since: "2024" },
  { name: "James Okonkwo", role: "Wicketkeeper", since: "2023" },
];

const Members = () => (
  <div>
    <PageHeader title="Members" subtitle="Our current club members" />
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div
            key={m.name}
            className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:shadow-sm transition"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-foreground">{m.name}</p>
              <p className="text-sm text-muted-foreground font-body">
                {m.role} · Member since {m.since}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Members;
