import PageHeader from "@/components/PageHeader";
import SEO from "@/components/SEO";

const Statutes = () => (
  <div>
    <SEO
      title="Statutes"
      description="Official statutes of Helsingborg United Sports Club (HUSC), adopted at the General Assembly on 20 February 2026."
      path="/statutes"
    />
    <PageHeader
      title="Club Statutes"
      subtitle="Official statutes adopted at the General Assembly — 20 February 2026"
    />
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="prose prose-sm max-w-none space-y-10 text-foreground font-body">

        {/* Preamble */}
        <p className="text-muted-foreground leading-relaxed">
          Helsingborg United Sports Club (or, alternatively, <strong>HUSC</strong>) is a non-profit
          sports club. These statutes were adopted at the General Assembly meeting of the interested
          members on Friday, 20th February 2026 at Helsingborg.
        </p>

        {/* 1. Naming */}
        <section>
          <h2 className="font-display text-xl text-foreground">1. Naming</h2>
          <p className="text-muted-foreground leading-relaxed">
            All the members of the group agree to name the organization as{" "}
            <strong>"Helsingborg United Sports Club"</strong>, which can be interoperably referred to
            as <strong>"HUSC"</strong>.
          </p>
        </section>

        {/* 2. Objectives */}
        <section>
          <h2 className="font-display text-xl text-foreground">2. Objectives</h2>
          <p className="text-muted-foreground leading-relaxed">
            HUSC was established on 2026-02-20, primarily as a nonprofit sports club to promote and
            play different sports activities amongst its members specific to (but not limited to)
            Cricket.
          </p>
        </section>

        {/* 3. Core Values */}
        <section>
          <h2 className="font-display text-xl text-foreground">3. Core Values of the Organization</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong>Members First</strong> — Of the Members, By the Members and For the Members</li>
            <li><strong>Cricket Initially</strong> — However, there will always be a scope to grow HUSC in other sporting areas, subject to overall members' interest</li>
            <li>Transparent &amp; Honest</li>
            <li>Ethical &amp; Legal</li>
            <li>Polite and Courteous</li>
            <li>Equal &amp; Neutral</li>
          </ul>
        </section>

        {/* 4. Membership */}
        <section>
          <h2 className="font-display text-xl text-foreground">4. Membership</h2>

          <h3 className="font-display text-lg text-foreground mt-4">4.1 Eligibility</h3>
          <p className="text-muted-foreground leading-relaxed">
            Any person (18+ years) who wishes to follow the statutes and values of the organization
            are welcome to request to become a member.
          </p>

          <h3 className="font-display text-lg text-foreground mt-4">4.2 Approval</h3>
          <p className="text-muted-foreground leading-relaxed">
            The governing body of HUSC holds the right to approve or reject any membership request
            and will provide justification for the decision.
          </p>

          <h3 className="font-display text-lg text-foreground mt-4">4.3 Membership Fees</h3>
          <p className="text-muted-foreground leading-relaxed">
            There will be a conditionally-refundable membership fee. Interested members can choose
            from the following options:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong>Yearly fees:</strong> 995 SEK</li>
            <li><strong>Tertiary fees:</strong> 350 SEK (every 4 months)</li>
          </ul>

          <h4 className="font-display text-base text-foreground mt-3">4.3.1 Payment Reminders</h4>
          <p className="text-muted-foreground leading-relaxed">
            Someone from the governing board (most likely the treasurer) will reach out to remind all
            the members at the beginning of a new tertiary (April, August and December every year) to
            pay the fees. However, the ultimate ownership lies with the member to pay the fees on
            time.
          </p>

          <h4 className="font-display text-base text-foreground mt-3">4.3.2 Non-Payment</h4>
          <p className="text-muted-foreground leading-relaxed">
            If a member fails to pay the membership fees within 4 months of the above reminder, the
            membership will be cancelled and the member will be notified via email.
          </p>

          <h3 className="font-display text-lg text-foreground mt-4">4.4 Non-Transferability</h3>
          <p className="text-muted-foreground leading-relaxed">
            The right to membership is not transferable.
          </p>

          <h3 className="font-display text-lg text-foreground mt-4">4.5 Refund of Membership Fees</h3>
          <p className="text-muted-foreground leading-relaxed">
            If a member is unable to continue their membership due to unavoidable circumstances (such
            as relocation or a family emergency), the member may submit a written appeal to the Board
            for consideration of a refund. Such requests will be considered only if less than 50% of
            the membership tenure has elapsed (i.e., less than two months for a tertiary-based
            subscription and less than six months for an annual subscription).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The Board will review the appeal and, if approved, will refund the proportionate amount
            based on the remaining membership tenure.
          </p>

          <h3 className="font-display text-lg text-foreground mt-4">4.6 Definition of a Member</h3>
          <p className="text-muted-foreground leading-relaxed">A member is a person:</p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>
              Who has voluntarily requested to become a member of HUSC through proper channels
              (website or Google form) and the request has been approved by the governing board.
            </li>
            <li>
              Who is paying the membership fees as per the regulations outlined in section 4.3 and
              its subsections above.
            </li>
          </ul>
        </section>

        {/* 5. Organization Structure & Operating Principles */}
        <section>
          <h2 className="font-display text-xl text-foreground">
            5. Organization Structure &amp; Operating Principles
          </h2>

          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>5.1</strong> Members of the club will be at the very top of all priorities. All
            members of HUSC will be treated equally and fairly, regardless of their race, gender,
            sexual orientation or level of individual athletic skills/background, and are expected to
            uphold the spirit of the game with their actions.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.2</strong> Members will elect/select a Board to represent them. The preferred
            option will be to select the Board members. If the number of contenders is higher, then
            the election route will be taken. Each year it will be encouraged to have newer faces on
            the Board.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.3</strong> HUSC initially will focus on playing cricket; however, it does not
            limit its scope to bring other sports under its umbrella. Any member who wants to
            encourage any other sports are always welcome to take the proposal, with a constructive
            plan to the governing board for further discussion.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.4</strong> When we will have members from different genders in HUSC, it will be
            encouraged to have equal representation of all genders on the Board.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.5</strong> Each member will have one vote.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.6</strong> The Board size will be 5–8 members.
          </p>

          <h3 className="font-display text-lg text-foreground mt-4">5.7 Office Bearers</h3>
          <p className="text-muted-foreground leading-relaxed">
            The Board members then select/elect the following office bearers:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong>5.7.1</strong> (Mandatory) Board President/Chairperson — one person</li>
            <li><strong>5.7.2</strong> (Mandatory) Secretary — preferably two people as joint secretaries</li>
            <li><strong>5.7.3</strong> (Mandatory) Treasurer — preferably two people as joint treasurers</li>
            <li><strong>5.7.4</strong> (Optional) Executive board member(s)</li>
          </ul>

          <p className="text-muted-foreground leading-relaxed mt-3">
            <strong>5.8</strong> The Board members (on a majority basis) may decide if the
            Chairperson, Secretary, or Treasurer should be changed during their tenure.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.9</strong> The Board will be led by a Board President/Chairperson.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.10</strong> The Board members will have a term of one year. The board will
            serve the organization from 1st April to 31st March every year.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.11</strong> Every year in February or March, the Board for the subsequent year
            should be elected/selected. In March end, there should be a handover between the
            incumbent Board and the new Board.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.12</strong> In case of any dispute in Board meetings or decisions, the majority
            decision will be final. If the dispute is still not resolved, a members' vote may be
            requested.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.13</strong> Each Board member has one vote. If there is a tie in any voting,
            the Board President can cast a second vote to finalize the decision.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.14</strong> Anyone who is on the Board or Working Group of any other sports
            club should not be part of the HUSC board, to ensure no conflict of interest. However,
            they are free to become a member, by following section 4 above.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.15</strong> Even in working group position selections, the Board should keep
            conflicts of interest in consideration. The reverse scenario is also true — any Board
            member of HUSC should not take up any role in the Board or Working Group of other similar
            institutions.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.16</strong> Fifty percent or more members of HUSC can change Board members, the
            entire Board, or any decision taken by the Board at any given point in time.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.17</strong> Any Board member resigning should submit a resignation letter to the
            Board President or Board Secretary and give 30 days' notice. The resignation should be
            communicated by the Board to the members within 7 days of submission.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.18</strong> Any member of the organization has the right to ask for any
            artefacts related to the organization (e.g., financial reports, plans, MOMs, etc.) from
            the Board, and the Board must present them to the members within a reasonable time,
            preferably within six weeks.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.19</strong> All positions in the organization are voluntary positions, and there
            will be no compensation involved.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.20</strong> Board members should have at least 50% attendance in Board meetings.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5.21</strong> Two-thirds of the members' vote is needed to change anything in the
            statute; however, this does not apply to section 5.3.
          </p>
        </section>

        {/* 6. Disciplinary Committee */}
        <section>
          <h2 className="font-display text-xl text-foreground">6. Disciplinary Committee</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>6.1</strong> The members of HUSC will always be at the core of the club.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>6.2</strong> During any game, if a member feels being insulted or not treated
            fairly, the member has the right to report the same to the board via any channel which
            the member may deem fit.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>6.3</strong> Upon receiving the complaint the board will decide if it needs to
            appoint a separate disciplinary committee, which will consist of 3 members of HUSC (with
            at least one member outside the board).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>6.4</strong> The disciplinary committee will summon all the parties involved and
            potential witnesses and hear their version of the event.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>6.5</strong> Post hearing, the disciplinary committee will furnish its report to
            the board with their recommended action.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>6.6</strong> The board will have the right to approve of or reject the recommended
            action from the disciplinary committee and will act accordingly.
          </p>
        </section>

        {/* 7. Meetings */}
        <section>
          <h2 className="font-display text-xl text-foreground">7. Meetings</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>7.1</strong> The Board should call for a general meeting with all the members, at
            least once every year.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>7.2</strong> Decisions taken in a General meeting will be valid if at least 50% of
            the members have participated in the General meeting. In case there are less than 50%
            participation then voting via online media shall be considered with an extended timeline
            of 48 hours.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>7.3</strong> The Board should meet among themselves at least once every quarter.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>7.4</strong> If 50%+ members agree, then they can ask the Board to hold an
            additional General meeting with 1 month's notice period.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>7.5</strong> Minutes of all Board meetings should be published with all the
            members.
          </p>
        </section>

        {/* 8. Finance & Accounts */}
        <section>
          <h2 className="font-display text-xl text-foreground">8. Finance &amp; Accounts</h2>

          <h3 className="font-display text-lg text-foreground mt-4">8.1 Sources of Funds</h3>
          <p className="text-muted-foreground leading-relaxed">
            The primary source of the funds of the Organisation shall be from the membership fees, as
            outlined in section 4.3. Additionally, voluntary contributions or donations by:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Members</li>
            <li>Benefactors</li>
            <li>The State</li>
            <li>Any other Institution</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">will also be accepted.</p>

          <p className="text-muted-foreground leading-relaxed mt-3">
            <strong>8.2</strong> The funds of the Organisation shall be deposited in bank accounts of
            a reputable Swedish bank in the name of the Organisation and the authorized joint
            signatories for operating such accounts shall be the Chairperson (President), the
            Secretary and the Treasurer. The signature of the Treasurer and one other signature of
            the Chairperson (President) or Secretary will suffice.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>8.3</strong> The Treasurer shall keep such proper books of accounts as will
            enable to present at every General Meeting of the Organisation, or at any other time if
            required (on reasonable notice to the treasurer) by the members, an accurate report and
            statement concerning the finances of the Organisation.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>8.4</strong> The statement of accounts will be published to all the members at
            least once every year. The calendar year shall be the financial year of the Organization
            (April–March).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>8.5</strong> For signing any agreement with the bank or with any other
            organizations, both the president and (one of) the treasurer should be the signatories.
            However, either the treasurer or the president will have the power to do regular financial
            transactions solely.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>8.6</strong> The funds will only be utilized towards the operating cost of the
            club.
          </p>
        </section>

        {/* 9. Conclusion */}
        <section>
          <h2 className="font-display text-xl text-foreground">9. Conclusion</h2>
          <p className="text-muted-foreground leading-relaxed">
            All the members hereby resolve to adopt the statute as described above and form the club
            named as <strong>"Helsingborg United Sports Club"</strong> or just{" "}
            <strong>"HUSC"</strong>.
          </p>
        </section>

      </div>
    </div>
  </div>
);

export default Statutes;
