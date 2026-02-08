import PageHeader from "@/components/PageHeader";
import { Mail } from "lucide-react";

const board = [
  { name: "Anna Lindqvist", role: "Chairperson", email: "anna@helsingborgunited.se", bio: "Passionate about growing cricket in Sweden. Leading the club since 2020." },
  { name: "Rajan Gupta", role: "Vice Chairperson", email: "rajan@helsingborgunited.se", bio: "Experienced cricketer with a vision for inclusive sports in Helsingborg." },
  { name: "Eva Magnusson", role: "Treasurer", email: "eva@helsingborgunited.se", bio: "Keeping our finances in order so we can focus on what matters — cricket!" },
  { name: "David Olsson", role: "Secretary", email: "david@helsingborgunited.se", bio: "Organising events and ensuring smooth club operations." },
  { name: "Samira Ali", role: "Training Coordinator", email: "samira@helsingborgunited.se", bio: "Planning sessions and making sure every member gets the best coaching." },
  { name: "Marcus Ek", role: "Events Manager", email: "marcus@helsingborgunited.se", bio: "Creating memorable match days and social events for the club." },
];

const Board = () => (
  <div>
    <PageHeader title="Board Members" subtitle="The team behind Helsingborg United SC" />
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {board.map((b) => (
          <div
            key={b.name}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
              <span className="font-display text-xl text-primary-foreground">
                {b.name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
            <h3 className="font-display text-xl text-foreground">{b.name}</h3>
            <p className="text-sm gold-accent font-display tracking-wide uppercase mt-1">{b.role}</p>
            <p className="text-muted-foreground text-sm mt-3 font-body leading-relaxed">{b.bio}</p>
            <a
              href={`mailto:${b.email}`}
              className="inline-flex items-center gap-1 text-primary text-sm mt-4 hover:underline font-body"
            >
              <Mail size={14} /> {b.email}
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Board;
