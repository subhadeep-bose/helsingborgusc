import PageHeader from "@/components/PageHeader";

const Privacy = () => (
  <div>
    <PageHeader title="Privacy Policy" subtitle="How we handle your personal data — GDPR compliant" />
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="prose prose-sm max-w-none space-y-8 text-foreground font-body">

        <section>
          <h2 className="font-display text-xl text-foreground">1. Data Controller</h2>
          <p className="text-muted-foreground leading-relaxed">
            Helsingborg United Sports Club ("the Club") is the data controller for the personal
            information collected through this website. Contact us at{" "}
            <a href="mailto:info@helsingborgunited.se" className="text-primary hover:underline">
              info@helsingborgunited.se
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
            <li>Cricket experience level</li>
            <li>Any free-text message you choose to provide</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">3. Why We Collect It</h2>
          <p className="text-muted-foreground leading-relaxed">
            We process your data based on your <strong>explicit consent</strong> (given at registration) for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Managing club membership and communication</li>
            <li>Organising training sessions and matches</li>
            <li>Displaying your first name and experience level on the public members page</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">4. What Is Publicly Visible</h2>
          <p className="text-muted-foreground leading-relaxed">
            Only your <strong>first name, last name, and experience level</strong> are shown on the
            public Members page. Your email, phone, date of birth, and messages are{" "}
            <strong>never</strong> displayed publicly and are only accessible to club administrators.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">5. Data Storage &amp; Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your data is stored in a secured, encrypted database hosted within the EU. Access is
            restricted to authorised club administrators via role-based access controls. We do not
            sell, share, or transfer your data to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">6. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">Under GDPR you have the right to:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong>Access</strong> — request a copy of your personal data</li>
            <li><strong>Rectification</strong> — ask us to correct inaccurate data</li>
            <li><strong>Erasure</strong> — ask us to delete your data ("right to be forgotten")</li>
            <li><strong>Restriction</strong> — ask us to limit processing of your data</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
            <li><strong>Withdrawal of consent</strong> — withdraw consent at any time</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            To exercise any of these rights, email{" "}
            <a href="mailto:info@helsingborgunited.se" className="text-primary hover:underline">
              info@helsingborgunited.se
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">7. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal data for as long as you are an active member. If you leave the
            club or request deletion, your data will be permanently removed within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">8. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this policy from time to time. Any changes will be posted on this page
            with the updated date. Last updated: February 2026.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
