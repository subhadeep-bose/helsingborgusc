import PageHeader from "@/components/PageHeader";
import SEO from "@/components/SEO";

const Privacy = () => (
  <div>
    <SEO title="Privacy Policy" description="GDPR-compliant privacy policy for Helsingborg United Sports Club." path="/privacy" />
    <PageHeader title="Privacy Policy" subtitle="How we handle your personal data — GDPR compliant" />
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="prose prose-sm max-w-none space-y-8 text-foreground font-body">

        <section>
          <h2 className="font-display text-xl text-foreground">1. Data Controller</h2>
          <p className="text-muted-foreground leading-relaxed">
            Helsingborg United Sports Club ("the Club") is the data controller for the personal
            information collected through this website. Contact us at{" "}
            <a href="mailto:helsingborgunitedsc@gmail.com" className="text-primary hover:underline">
              helsingborgunitedsc@gmail.com
            </a>{" "}
            for any data-related enquiries.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">2. What We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you register as a member we collect:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>First and last name</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Date of birth (optional)</li>
            <li>Place of birth (optional)</li>
            <li>Cricket experience level</li>
            <li>How you heard about us (referral source, optional)</li>
            <li>Any free-text message you choose to provide</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            We also collect <strong>technical data</strong> automatically: IP address, browser type, pages visited,
            and timestamps. This data is used solely for website security and performance monitoring.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">3. Why We Collect It</h2>
          <p className="text-muted-foreground leading-relaxed">
            We process your data based on your <strong>explicit consent</strong> (given at registration) for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Managing club membership and communication</li>
            <li>Organising training sessions and matches</li>
            <li>Displaying your first name, last name, and experience level on the public members page</li>
            <li>Improving our outreach based on aggregated referral statistics</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">4. What Is Publicly Visible</h2>
          <p className="text-muted-foreground leading-relaxed">
            Only your <strong>first name, last name, and experience level</strong> are shown on the
            public Members page. Your email, phone, date of birth, place of birth, referral source,
            and messages are <strong>never</strong> displayed publicly and are only accessible to
            club administrators.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">5. Data Storage, Security &amp; Sub-processors</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your data is stored in a secured, encrypted PostgreSQL database provided by{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Supabase Inc.
            </a>{" "}
            (our sole data sub-processor), hosted in the <strong>EU (Frankfurt, AWS eu-central-1)</strong>.
            Supabase processes data under a{" "}
            <a href="https://supabase.com/legal/dpa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Data Processing Agreement (DPA)
            </a>{" "}
            compliant with GDPR Article 28.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Access is restricted to authorised club administrators via role-based access controls
            and row-level security policies. All data is encrypted at rest (AES-256) and in transit (TLS 1.2+).
            We do not sell, share, or transfer your data to any other third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">6. Cookies &amp; Local Storage</h2>
          <p className="text-muted-foreground leading-relaxed">
            This website uses <strong>essential cookies only</strong> — specifically, a session token
            stored in <code className="text-sm bg-muted px-1 rounded">localStorage</code> for authentication purposes.
            We do <strong>not</strong> use analytics cookies, tracking pixels, or any third-party
            advertising technologies. Because only strictly necessary cookies are used, no cookie
            consent banner is required under GDPR.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">7. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">Under GDPR you have the right to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong>Access</strong> — request a copy of your personal data</li>
            <li><strong>Rectification</strong> — ask us to correct inaccurate data</li>
            <li><strong>Erasure</strong> — ask us to delete your data ("right to be forgotten")</li>
            <li><strong>Restriction</strong> — ask us to limit processing of your data</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format (JSON/CSV)</li>
            <li><strong>Withdrawal of consent</strong> — withdraw consent at any time without affecting prior processing</li>
            <li><strong>Lodge a complaint</strong> — contact the Swedish Authority for Privacy Protection (<a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">IMY</a>)</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            To exercise any of these rights, email{" "}
            <a href="mailto:helsingborgunitedsc@gmail.com" className="text-primary hover:underline">
              helsingborgunitedsc@gmail.com
            </a>.
            We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">8. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal data for as long as you are an active member. Specifically:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong>Active members</strong> — data kept for the duration of membership</li>
            <li><strong>Inactive members</strong> — data deleted 12 months after last activity or departure</li>
            <li><strong>Rejected applications</strong> — data deleted within 90 days</li>
            <li><strong>Deletion requests</strong> — data permanently removed within 30 days</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Aggregated, anonymised statistics (e.g. total member count by experience level) may be
            retained indefinitely as they cannot identify individuals.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">9. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this policy from time to time. Any changes will be posted on this page
            with the updated date. Last updated: <strong>February 2026</strong>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
