import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, ArrowRight, Megaphone, Clock, Gamepad2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import heroImage from "@/assets/hero-cricket.jpg";
import { CountdownTimer, AnimatedStats, CricketFacts } from "@/components/widgets";

const features = [
  {
    icon: Calendar,
    title: "Regular Training",
    desc: "Weekend sessions year-round, with extra weekday cricket in summer.",
  },
  {
    icon: Users,
    title: "Community",
    desc: "A welcoming club for cricket enthusiasts of all backgrounds.",
  },
  {
    icon: Trophy,
    title: "Friendly Matches",
    desc: "Compete in local leisure tournaments throughout the season.",
  },
];

interface Announcement {
  id: string;
  title: string;
  summary: string;
  tag: string;
  published_at: string;
}

const Index = () => {
  const [news, setNews] = useState<Announcement[]>([]);
  const [nextEvent, setNextEvent] = useState<{ title: string; date: string } | null>(null);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, title, summary, tag, published_at")
      .order("published_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setNews(data ?? []));

    supabase
      .from("schedule_entries")
      .select("day, type, event_date, location")
      .not("event_date", "is", null)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setNextEvent({
            title: `${data[0].type} — ${data[0].day}`,
            date: data[0].event_date!,
          });
        }
      });
  }, []);

  return (
    <div className="font-body">
      <SEO path="/" />
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        <img
          src={heroImage}
          alt="Cricket match at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative container mx-auto px-4 pt-20">
          <div className="max-w-2xl">
            <p className="font-display text-sm tracking-[0.3em] uppercase gold-accent mb-4">
              Helsingborg, Sweden
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-primary-foreground leading-[1.1] tracking-wide">
              Helsingborg United{" "}
              <span className="gold-accent">Sports Club</span>
            </h1>
            <p className="mt-6 text-primary-foreground/80 text-lg md:text-xl max-w-lg leading-relaxed">
              Leisure cricket for everyone — weekends year-round, plus weekday
              sessions in the summer. Join our passionate community and discover
              the joy of cricket in Sweden.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/registration"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-display text-sm tracking-wider uppercase px-8 py-3 rounded hover:brightness-110 transition"
              >
                Join the Club <ArrowRight size={16} />
              </Link>
              <Link
                to="/schedule"
                className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground font-display text-sm tracking-wider uppercase px-8 py-3 rounded hover:bg-primary-foreground/10 transition"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-section-alt">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-foreground text-center tracking-wide">
            Why <span className="gold-accent">Join Us</span>?
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-lg p-8 shadow-sm border border-border hover:shadow-md transition animate-fade-in"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats & Widgets */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl text-foreground text-center tracking-wide mb-12">
            Club by the <span className="gold-accent">Numbers</span>
          </h2>
          <AnimatedStats
            stats={[
              { label: "Members", value: 60, suffix: "+" },
              { label: "Training Sessions", value: 200, suffix: "+" },
              { label: "Matches Played", value: 35 },
              { label: "Years Active", value: 10, suffix: "+" },
            ]}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-3xl mx-auto">
            {nextEvent && (
              <CountdownTimer targetDate={nextEvent.date} eventName={nextEvent.title} />
            )}
            <CricketFacts />
          </div>
        </div>
      </section>

      {/* News & Announcements */}
      {news.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-12">
              <Megaphone size={28} className="text-primary" />
              <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-wide">
                News & <span className="gold-accent">Announcements</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-display uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded">
                      {item.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />{" "}
                      {new Date(item.published_at).toLocaleDateString("sv-SE", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fun Zone CTA */}
      <section className="py-16 bg-section-alt">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <Gamepad2 size={36} className="text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
              Visit the <span className="gold-accent">Fun Zone</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Mini-games, cricket quizzes, reaction tests, and more — take a break and have some fun!
            </p>
            <Link
              to="/fun"
              className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-8 py-3 rounded hover:brightness-110 transition"
            >
              Play Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-primary-foreground tracking-wide">
            Ready to Play?
          </h2>
          <p className="mt-4 text-primary-foreground/70 max-w-md mx-auto">
            No experience needed. All skill levels welcome. Weekends year-round and weekday sessions in summer — come join the fun.
          </p>
          <Link
            to="/registration"
            className="mt-8 inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-display text-sm tracking-wider uppercase px-10 py-4 rounded hover:brightness-110 transition"
          >
            Register Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
