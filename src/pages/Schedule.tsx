import PageHeader from "@/components/PageHeader";
import { Clock, MapPin, CalendarDays } from "lucide-react";

const schedule = [
  { day: "Saturday", time: "10:00 – 12:00", type: "Batting Practice", location: "Olympia Cricket Ground", color: "bg-primary" },
  { day: "Saturday", time: "13:00 – 15:00", type: "Bowling & Fielding", location: "Olympia Cricket Ground", color: "bg-cricket-light" },
  { day: "Sunday", time: "09:00 – 11:00", type: "Net Sessions", location: "Helsingborg Sports Hall", color: "bg-primary" },
  { day: "Sunday", time: "11:30 – 14:00", type: "Weekend Match", location: "Olympia Cricket Ground", color: "bg-secondary" },
];

const upcoming = [
  { date: "Feb 15, 2026", event: "Season Opening Practice", location: "Olympia Cricket Ground" },
  { date: "Mar 1, 2026", event: "Friendly vs Malmö CC", location: "Olympia Cricket Ground" },
  { date: "Mar 15, 2026", event: "Spring Tournament", location: "Lund Cricket Club" },
  { date: "Apr 5, 2026", event: "Annual General Meeting", location: "Helsingborg Community Centre" },
];

const Schedule = () => (
  <div>
    <PageHeader title="Training Schedule" subtitle="Weekly sessions and upcoming events" />
    <div className="container mx-auto px-4 py-16">
      {/* Weekly schedule */}
      <h2 className="font-display text-2xl text-foreground mb-6">Weekly Training</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {schedule.map((s, i) => (
          <div
            key={i}
            className="flex gap-4 bg-card border border-border rounded-lg p-5 hover:shadow-sm transition"
          >
            <div className={`w-1.5 rounded-full ${s.color} flex-shrink-0`} />
            <div>
              <p className="font-display text-lg text-foreground">{s.type}</p>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground font-body">
                <span className="flex items-center gap-2"><CalendarDays size={14} /> {s.day}</span>
                <span className="flex items-center gap-2"><Clock size={14} /> {s.time}</span>
                <span className="flex items-center gap-2"><MapPin size={14} /> {s.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <h2 className="font-display text-2xl text-foreground mb-6">Upcoming Events</h2>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {upcoming.map((u, i) => (
          <div
            key={i}
            className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-6 py-4 ${
              i !== upcoming.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="font-display text-sm gold-accent min-w-[120px]">{u.date}</span>
            <span className="font-body text-foreground flex-1">{u.event}</span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin size={12} /> {u.location}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Schedule;
