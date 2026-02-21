import { Link } from "react-router-dom";
import { ArrowRight, Radio, CalendarDays } from "lucide-react";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import LiveCricketScores from "@/components/widgets/LiveCricketScores";
import UpcomingMatches from "@/components/widgets/UpcomingMatches";

const CricketLive = () => {
  return (
    <div className="font-body">
      <SEO
        title="India Cricket Live — Helsingborg United SC"
        description="Live scores and upcoming international cricket matches involving India. Stay updated with real-time scoreboards!"
        path="/cricket-live"
      />
      <PageHeader
        title="India Cricket Live"
        subtitle="Live scores & upcoming international matches featuring Team India 🇮🇳🏏"
      />

      <section className="container mx-auto px-4 py-12">
        {/* Live Scores */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Radio size={20} className="text-destructive" />
            <h2 className="font-display text-2xl text-foreground tracking-wide">
              Live & <span className="gold-accent">Recent Scores</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl">
            Real-time scores for ongoing and recently completed international matches
            involving India. Updates every 60 seconds.
          </p>
          <LiveCricketScores />
        </div>

        {/* Upcoming Matches */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays size={20} className="text-primary" />
            <h2 className="font-display text-2xl text-foreground tracking-wide">
              Upcoming <span className="gold-accent">India Matches</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl">
            Scheduled international matches — ODIs, T20Is, and Tests.
          </p>
          <UpcomingMatches limit={10} />
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Want to play cricket yourself? Join our club!
          </p>
          <Link
            to="/registration"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-8 py-3 rounded hover:brightness-110 transition"
          >
            Join Helsingborg United <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CricketLive;
