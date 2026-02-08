import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-cricket.jpg";

const features = [
  {
    icon: Calendar,
    title: "Weekend Training",
    desc: "Regular Saturday & Sunday sessions for all skill levels.",
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

const Index = () => {
  return (
    <div className="font-body">
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
              Weekend leisure cricket for everyone. Join our passionate community
              and discover the joy of cricket in Sweden.
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

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-primary-foreground tracking-wide">
            Ready to Play?
          </h2>
          <p className="mt-4 text-primary-foreground/70 max-w-md mx-auto">
            No experience needed. All skill levels welcome. Come join us for a weekend of cricket and fun.
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
