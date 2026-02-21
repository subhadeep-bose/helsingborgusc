import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import {
  CricketHitGame,
  CricketQuiz,
  ReactionTest,
  CricketFacts,
  LiveClock,
  AnimatedStats,
} from "@/components/widgets";

const stats = [
  { label: "Members", value: 60, suffix: "+" },
  { label: "Training Sessions", value: 200, suffix: "+" },
  { label: "Matches Played", value: 35 },
  { label: "Years Active", value: 10, suffix: "+" },
];

const FunZone = () => {
  return (
    <div className="font-body">
      <SEO
        title="Fun Zone — Helsingborg United SC"
        description="Interactive mini-games, quizzes, and fun cricket widgets. Test your reflexes, play Cricket Hit, and learn fun facts!"
        path="/fun"
      />
      <PageHeader
        title="Fun Zone"
        subtitle="Mini-games, trivia, and interactive widgets — take a break and have some fun! 🏏"
      />

      <section className="container mx-auto px-4 py-12">
        {/* Stats */}
        <div className="mb-14">
          <h2 className="font-display text-2xl text-foreground tracking-wide text-center mb-8">
            Club by the <span className="gold-accent">Numbers</span>
          </h2>
          <AnimatedStats stats={stats} />
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          <div>
            <h2 className="font-display text-xl text-foreground tracking-wide mb-4">
              🏏 Cricket Hit!
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tap the balls before they leave the pitch. 30 seconds — how many can you hit?
            </p>
            <CricketHitGame />
          </div>

          <div>
            <h2 className="font-display text-xl text-foreground tracking-wide mb-4">
              🧠 Cricket Quiz
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Test your cricket knowledge across three difficulty levels.
            </p>
            <CricketQuiz />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          <div>
            <h2 className="font-display text-xl text-foreground tracking-wide mb-4">
              ⚡ Reaction Test
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Wait for green, then tap as fast as you can. Great reflexes make great fielders!
            </p>
            <ReactionTest />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl text-foreground tracking-wide mb-4">
                🕐 Local Time
              </h2>
              <LiveClock />
            </div>
            <div>
              <h2 className="font-display text-xl text-foreground tracking-wide mb-4">
                💡 Did You Know?
              </h2>
              <CricketFacts />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FunZone;
