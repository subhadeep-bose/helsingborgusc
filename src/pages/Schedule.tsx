import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Clock, MapPin, CalendarDays, Search, Filter, CalendarPlus } from "lucide-react";
import SEO from "@/components/SEO";
import { downloadICS } from "@/lib/ics";
import { useScheduleEntries } from "@/hooks/queries";

const Schedule = () => {
  const { data: entries = [], isLoading: loading } = useScheduleEntries();
  const [dayFilter, setDayFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [eventSearch, setEventSearch] = useState("");

  const weekly = useMemo(() => entries.filter(e => e.category === "weekly"), [entries]);
  const events = useMemo(() => entries.filter(e => e.category === "event"), [entries]);

  const days = useMemo(() => [...new Set(weekly.map(w => w.day))], [weekly]);
  const locations = useMemo(() => [...new Set([...weekly, ...events].map(e => e.location))], [weekly, events]);

  const filteredWeekly = weekly.filter(s => {
    if (dayFilter && s.day !== dayFilter) return false;
    if (locationFilter && s.location !== locationFilter) return false;
    return true;
  });

  const filteredEvents = events.filter(e => {
    const q = eventSearch.toLowerCase();
    if (locationFilter && e.location !== locationFilter) return false;
    if (q && !e.type.toLowerCase().includes(q) && !e.location.toLowerCase().includes(q)) return false;
    return true;
  });

  const colors = ["bg-primary", "bg-cricket-light", "bg-primary", "bg-secondary"];

  if (loading) {
    return (
      <div>
        <SEO title="Training Schedule" description="View training times and upcoming cricket events at Helsingborg United SC." path="/schedule" />
        <PageHeader title="Training Schedule" subtitle="Weekends year-round · Weekday sessions in summer · Upcoming events" />
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEO title="Training Schedule" description="View training times and upcoming cricket events at Helsingborg United SC." path="/schedule" />
      <PageHeader title="Training Schedule" subtitle="Weekends year-round · Weekday sessions in summer · Upcoming events" />
      <div className="container mx-auto px-4 py-16">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Filter size={14} /> Filters:</div>
          <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">All Days</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <h2 className="font-display text-2xl text-foreground mb-6">Weekly Training</h2>
        {filteredWeekly.length === 0 ? (
          <p className="text-muted-foreground text-sm mb-16">No sessions match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {filteredWeekly.map((s, i) => (
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
        )}

        <h2 className="font-display text-2xl text-foreground mb-4">Upcoming Events</h2>
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 mb-6 max-w-md">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input value={eventSearch} onChange={e => setEventSearch(e.target.value)} placeholder="Search events…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        {filteredEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No events match your filters.</p>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {filteredEvents.map((u, i) => (
              <div
                key={u.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-6 py-4 ${
                  i !== filteredEvents.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="font-display text-sm gold-accent min-w-[120px]">
                  {u.event_date ? new Date(u.event_date + "T00:00:00").toLocaleDateString("sv-SE", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </span>
                <span className="font-body text-foreground flex-1">{u.type}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin size={12} /> {u.location}
                </span>
                {u.event_date && (
                  <button
                    onClick={() => {
                      const d = new Date(u.event_date + "T10:00:00");
                      const end = new Date(d.getTime() + 3 * 60 * 60 * 1000);
                      downloadICS({ title: u.type, location: u.location, start: d, end });
                    }}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition shrink-0"
                    title="Add to calendar"
                  >
                    <CalendarPlus size={14} /> .ics
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
