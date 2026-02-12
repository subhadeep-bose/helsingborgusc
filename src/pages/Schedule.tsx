import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Clock, MapPin, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleEntry {
  id: string;
  day: string;
  time: string;
  type: string;
  location: string;
  category: string;
  event_date: string | null;
}

const Schedule = () => {
  const [weekly, setWeekly] = useState<ScheduleEntry[]>([]);
  const [events, setEvents] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("schedule_entries")
      .select("id, day, time, type, location, category, event_date")
      .order("sort_order")
      .then(({ data }) => {
        const entries = data ?? [];
        setWeekly(entries.filter(e => e.category === "weekly"));
        setEvents(entries.filter(e => e.category === "event"));
        setLoading(false);
      });
  }, []);

  const colors = ["bg-primary", "bg-cricket-light", "bg-primary", "bg-secondary"];

  if (loading) {
    return (
      <div>
        <PageHeader title="Training Schedule" subtitle="Weekly sessions and upcoming events" />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Training Schedule" subtitle="Weekly sessions and upcoming events" />
      <div className="container mx-auto px-4 py-16">
        <h2 className="font-display text-2xl text-foreground mb-6">Weekly Training</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {weekly.map((s, i) => (
            <div key={s.id} className="flex gap-4 bg-card border border-border rounded-lg p-5 hover:shadow-sm transition">
              <div className={`w-1.5 rounded-full ${colors[i % colors.length]} flex-shrink-0`} />
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

        <h2 className="font-display text-2xl text-foreground mb-6">Upcoming Events</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {events.map((u, i) => (
            <div
              key={u.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-6 py-4 ${
                i !== events.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="font-display text-sm gold-accent min-w-[120px]">
                {u.event_date ? new Date(u.event_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
              </span>
              <span className="font-body text-foreground flex-1">{u.type}</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin size={12} /> {u.location}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
