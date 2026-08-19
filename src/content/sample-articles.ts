import { doc, em, h2, p, quote, readingMinutes, t, type Article } from "@/lib/content";
import { authors } from "./authors";

/**
 * Sample content for Stage 1.
 *
 * Ten pieces spread across all seven regions, so every colour in the system and
 * every part of the map is visible the moment the site is opened. The shape is
 * exactly the Stage 2 Prisma model, so this file is deleted rather than migrated
 * once the database exists.
 */

type Draft = Omit<Article, "readingMinutes">;

const drafts: Draft[] = [
  {
    id: "a1",
    slug: "what-we-owe-the-unborn",
    kicker: "The Long View",
    title: "What We Owe the Unborn",
    dek: "Longtermism asks us to weigh the interests of people who do not exist yet. The arithmetic is seductive, and that is precisely the problem.",
    lenses: ["philosophy"],
    excerpt:
      "Longtermism asks us to weigh the interests of people who do not exist yet. The arithmetic is seductive, and that is precisely the problem.",
    status: "published",
    publishedAt: "2026-03-04T09:00:00.000Z",
    author: authors.hale!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "There is a certain kind of argument that wins on paper and loses everywhere else. Start from the premise that a future person's suffering counts exactly as much as a present person's. Add the observation that there could be a very large number of future people. Conclude that almost any present sacrifice is justified if it raises the odds that those people come to exist in comfort.",
        ),
      ),
      p(
        t(
          "Each step looks defensible. The conclusion is close to monstrous. Philosophers call this a reductio, and the usual response is to go back and find the faulty premise. What is striking about the longtermist literature is how rarely anyone does.",
        ),
      ),
      h2("The trouble with very large numbers"),
      p(
        t(
          "The difficulty is not that future people do not matter. It is that once a number gets large enough, it stops functioning as a quantity and starts functioning as a trump card. Any finite present harm divided by a sufficiently vast future benefit rounds to zero. The framework does not so much answer moral questions as dissolve them.",
        ),
      ),
      quote(
        "A moral theory that can justify anything has told you nothing about what to do on Tuesday.",
      ),
      p(
        t("This is why the more careful writers in the field keep reaching for "),
        em("side constraints"),
        t(
          ": rules that hold regardless of the arithmetic. But a constraint that survives contact with an infinite payoff is doing the real work, and the arithmetic is decoration.",
        ),
      ),
    ),
  },
  {
    id: "a2",
    slug: "the-quiet-return-of-virtue",
    kicker: "Ideas",
    title: "The Quiet Return of Virtue",
    dek: "Rules and outcomes have dominated moral philosophy for two centuries. Character is coming back, and not only among philosophers.",
    lenses: ["philosophy"],
    excerpt:
      "Rules and outcomes have dominated moral philosophy for two centuries. Character is coming back, and not only among philosophers.",
    status: "published",
    publishedAt: "2026-04-18T09:00:00.000Z",
    author: authors.hale!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "For most of the twentieth century, moral philosophy in the English-speaking world offered two options. You could ask which rule a good person follows, or you could ask which outcome a good act produces. Both approaches share an assumption so deep it usually goes unstated: that ethics is a decision procedure, a machine you feed a dilemma and read an answer from.",
        ),
      ),
      p(
        t(
          "Virtue ethics rejects the framing. It asks a different question, one closer to how people actually deliberate: what would a person of good character do here, and what kind of person am I becoming by choosing this?",
        ),
      ),
      h2("Why now"),
      p(
        t(
          "The revival has less to do with argument than with exhaustion. Institutions designed as rule-following machines have spent two decades demonstrating that rules can be satisfied while the point of the rules is defeated. Compliance departments grow; trust does not.",
        ),
      ),
      p(
        t(
          "The obvious objection is that character is unmeasurable and therefore unmanageable. That is true, and it may be the point. A standard that cannot be gamed by satisfying its letter is worth something precisely because it resists the audit.",
        ),
      ),
    ),
  },
  {
    id: "a3",
    slug: "coalitions-of-exhaustion",
    kicker: "Europe",
    title: "Coalitions of Exhaustion",
    dek: "Across the continent, governments are being assembled not from agreement but from the absence of any alternative. They are lasting longer than anyone expected.",
    lenses: ["politics"],
    excerpt:
      "Governments are being assembled not from agreement but from the absence of any alternative. They are lasting longer than anyone expected.",
    status: "published",
    publishedAt: "2026-02-11T09:00:00.000Z",
    author: authors.lindqvist!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "The textbook account of coalition formation assumes parties are trying to get something. They enter government to enact a programme, and the bargaining is over whose programme dominates. Increasingly, the parties negotiating in European capitals are trying to prevent something instead.",
        ),
      ),
      p(
        t(
          "This produces governments with no positive agenda and remarkable staying power. If the coalition exists to keep a particular party out of office, then every member has an interest in its survival that is entirely independent of whether it governs well.",
        ),
      ),
      h2("The cost of durability"),
      p(
        t(
          "Stability of this kind is not free. A government that cannot say what it is for struggles to explain why anything it does is worth the disruption. Voters notice. The coalition holds, the mandate erodes, and the party it was built to exclude spends four years as the only participant in the argument.",
        ),
      ),
    ),
  },
  {
    id: "a4",
    slug: "the-incumbency-trap",
    kicker: "Elections",
    title: "The Incumbency Trap",
    dek: "Holding office used to be an electoral asset. In most rich democracies it has quietly become a liability, and the reasons are structural rather than personal.",
    lenses: ["politics"],
    excerpt:
      "Holding office used to be an electoral asset. In most rich democracies it has quietly become a liability.",
    status: "published",
    publishedAt: "2026-05-22T09:00:00.000Z",
    author: authors.lindqvist!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "For decades the incumbency advantage was one of the sturdier findings in political science. Sitting members won more often, and by wider margins, than their records alone would predict. Name recognition, constituency service, and privileged access to money compounded into a reliable edge.",
        ),
      ),
      p(
        t(
          "That edge has been narrowing for twenty years, and in several countries it has inverted. The candidate associated with the current state of things now starts behind.",
        ),
      ),
      h2("What changed"),
      p(
        t(
          "Three things, mostly. Media fragmentation destroyed the local coverage that made constituency service visible. Nationalised politics meant local records stopped mattering to voters weighing a national choice. And a long run of governments inheriting problems they could not solve taught electorates that responsibility and blame amount to the same thing.",
        ),
      ),
    ),
  },
  {
    id: "a5",
    slug: "who-counts-as-a-citizen",
    kicker: "Membership",
    title: "Who Counts as a Citizen",
    dek: "Every theory of justice assumes a boundary around the people it applies to. Almost none of them can justify where that boundary falls.",
    lenses: ["philosophy", "politics"],
    excerpt:
      "Every theory of justice assumes a boundary around the people it applies to. Almost none can justify where that boundary falls.",
    status: "published",
    publishedAt: "2026-01-28T09:00:00.000Z",
    author: authors.roda!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "Political philosophy has a founding embarrassment. Theories of distributive justice tell us in careful detail how goods should be shared among the members of a society. They are close to silent on how someone becomes a member.",
        ),
      ),
      p(
        t(
          "The silence is not an oversight so much as a necessity. Any principle general enough to justify the boundary tends to be general enough to dissolve it.",
        ),
      ),
      quote(
        "A theory of justice that takes its own membership as given has assumed the answer to the hardest question it faces.",
      ),
      h2("The democratic version of the problem"),
      p(
        t(
          "Democracies face a sharper form of it. The legitimacy of a decision rests on the consent of those bound by it. But the decision about who is bound cannot itself rest on their consent, because the group has not been constituted yet. Every founding is, in this sense, an act that its own principles cannot authorise.",
        ),
      ),
      p(
        t(
          "Practically, this is why arguments about immigration so rarely resolve. One side argues from within the boundary and the other argues about where it should sit. They are not disagreeing about the answer. They are disagreeing about which question is being asked.",
        ),
      ),
    ),
  },
  {
    id: "a6",
    slug: "the-productivity-puzzle",
    kicker: "Growth",
    title: "The Productivity Puzzle Nobody Solved",
    dek: "Two decades of stagnant output per hour, in almost every advanced economy, through booms and busts alike. The explanations keep failing.",
    lenses: ["economics"],
    excerpt:
      "Two decades of stagnant output per hour across almost every advanced economy. The explanations keep failing.",
    status: "published",
    publishedAt: "2026-03-19T09:00:00.000Z",
    author: authors.okonjo!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "Productivity growth is the closest thing economics has to a measure of whether things are getting better. It is output per hour worked, and over long horizons it determines almost everything else: wages, public revenue, the sustainability of pensions, how much a society can afford to argue about.",
        ),
      ),
      p(
        t(
          "Since roughly 2005 it has been close to flat across the rich world. This happened during the largest deployment of information technology in history, which is the part nobody has satisfactorily explained.",
        ),
      ),
      h2("The candidate explanations"),
      p(
        t(
          "Mismeasurement is the most comfortable answer and the weakest: the gap is far too large and too widespread across countries with different statistical agencies. Financial-crisis scarring explains the timing in some economies but not in the ones that avoided the crisis.",
        ),
      ),
      p(
        t(
          "The most uncomfortable possibility is that the recent technologies are simply less economically transformative than electrification or the internal combustion engine, and that we have spent twenty years comparing ourselves to an unusually good century.",
        ),
      ),
    ),
  },
  {
    id: "a7",
    slug: "when-central-banks-run-out-of-room",
    kicker: "Monetary Policy",
    title: "When Central Banks Run Out of Room",
    dek: "The policy rate has done most of the work of macroeconomic management for forty years. It may not be able to do so again.",
    lenses: ["economics"],
    excerpt:
      "The policy rate has done most of the work of macroeconomic management for forty years. It may not be able to again.",
    status: "published",
    publishedAt: "2026-06-09T09:00:00.000Z",
    author: authors.okonjo!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "The intellectual settlement that emerged in the 1980s was elegant. Give an independent central bank one instrument and one target, and let fiscal policy worry about everything else. For a quarter of a century it worked well enough that most people forgot it had ever been a choice.",
        ),
      ),
      p(
        t(
          "The settlement depends on a condition that no longer reliably holds: that the neutral rate of interest sits far enough above zero for cuts to have somewhere to go.",
        ),
      ),
      h2("What replaces it"),
      p(
        t(
          "Nothing yet, which is the problem. Each candidate requires either a central bank to do something it was deliberately designed not to do, or a finance ministry to do something no electoral cycle rewards. Institutional design is easier to get right once than to change afterwards.",
        ),
      ),
    ),
  },
  {
    id: "a8",
    slug: "the-price-of-a-statistical-life",
    kicker: "Method",
    title: "The Price of a Statistical Life",
    dek: "Governments put a number on a human life every day. The number is defensible, the practice is necessary, and almost nobody can say so out loud.",
    lenses: ["philosophy", "economics"],
    excerpt:
      "Governments put a number on a human life every day. The practice is necessary and almost nobody can say so out loud.",
    status: "published",
    publishedAt: "2026-04-02T09:00:00.000Z",
    author: authors.roda!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "Every road that gets built could have been built safer. Every drug approval could have waited for more data. A government that refused on principle to trade safety against cost would build no roads and approve no drugs, so it makes the trade, and to make it consistently it needs a number.",
        ),
      ),
      p(
        t(
          "The number is called the value of a statistical life, and it is among the most misunderstood figures in public policy. It is not the price of a person. It is the rate at which a population, revealed through its own choices, trades small changes in risk against money.",
        ),
      ),
      h2("Why the distinction fails to reassure"),
      p(
        t(
          "The distinction is real, and it does not fully answer the objection. Preferences over small risks are measured largely in labour markets, where the people taking on additional risk tend to be those with the least power to refuse it.",
        ),
      ),
      p(
        t("What the method captures is therefore partly a valuation and partly a "),
        em("distribution of bargaining power"),
        t(
          ", and the arithmetic cannot separate the two. The figure is still better than the alternative of deciding by instinct. It is not the neutral instrument it is usually presented as.",
        ),
      ),
    ),
  },
  {
    id: "a9",
    slug: "industrial-policy-returns",
    kicker: "The State",
    title: "Industrial Policy and the Return of the State",
    dek: "Picking winners was the great heresy of the postwar consensus. It is now the declared policy of nearly every major economy, and the old objections have not gone away.",
    lenses: ["politics", "economics"],
    excerpt:
      "Picking winners was the great heresy of the postwar consensus. It is now the declared policy of nearly every major economy.",
    status: "published",
    publishedAt: "2026-05-07T09:00:00.000Z",
    author: authors.okonjo!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "For thirty years the case against industrial policy was considered closed. Governments lack the information to identify promising industries, and they face political incentives that guarantee the subsidy flows to the loudest incumbent rather than the most promising entrant.",
        ),
      ),
      p(
        t(
          "Neither objection has been refuted. What changed is that the alternative stopped being politically available. Once supply chains became a security question rather than a commercial one, the choice was no longer between industrial policy and the market.",
        ),
      ),
      h2("The knowledge problem has not been solved"),
      p(
        t(
          "It has been reclassified. When the stated goal is capacity rather than efficiency, a programme can fail every economic test and still be counted a success, because the criterion has moved.",
        ),
      ),
      p(
        t(
          "That is a coherent position, and in a genuine security emergency it is the right one. It is not the same as having answered the objection, and the difference will show up in the fiscal arithmetic within a decade.",
        ),
      ),
    ),
  },
  {
    id: "a10",
    slug: "rent-power-and-the-good-life",
    kicker: "Housing",
    title: "Rent, Power, and the Good Life",
    dek: "Housing is where the three disciplines meet and refuse to agree. What a home is for, who decides, and what it costs are not separate questions.",
    lenses: ["philosophy", "politics", "economics"],
    excerpt:
      "Housing is where the three disciplines meet and refuse to agree. What a home is for, who decides, and what it costs are one question.",
    status: "published",
    publishedAt: "2026-06-24T09:00:00.000Z",
    author: authors.roda!,
    coverImage: null,
    coverCredit: null,
    body: doc(
      p(
        t(
          "Ask an economist why housing is expensive and you will get an answer about supply, planning restriction, and the elasticity of construction. Ask a political scientist and you will get an answer about who turns out in local elections. Ask a philosopher and you will get a question back: expensive relative to what, and expensive for whom to do what?",
        ),
      ),
      p(
        t(
          "All three are correct and none is sufficient, which is what makes housing the clearest case for reading a problem through more than one lens at a time.",
        ),
      ),
      quote(
        "A shortage is an economic fact, a planning regime is a political choice, and a home is a precondition for almost everything a life is made of.",
      ),
      h2("Three answers to one question"),
      p(
        t(
          "The economic account explains the price. Supply has not responded to demand in the places where people most want to live, and the reasons are well documented.",
        ),
      ),
      p(
        t(
          "The political account explains why the price persists despite being enormously unpopular. The people who benefit from restriction are concentrated, organised, and reliably vote in the elections that decide it. The people who lose are dispersed, younger, and frequently not yet resident in the jurisdiction making the decision.",
        ),
      ),
      p(
        t(
          "The philosophical account explains why any of it matters. If a home is merely an asset, high prices are a distributional matter and nothing more. If it is instead a precondition for forming stable relationships, raising children, and planning a life at all, then a housing shortage is not an inconvenience in the market for one good. It is a constraint on the range of lives available to a generation, which is a different kind of claim and calls for a different kind of urgency.",
        ),
      ),
    ),
  },
];

export const sampleArticles: readonly Article[] = drafts.map((d) => ({
  ...d,
  readingMinutes: readingMinutes(d.body),
}));

/* The three functions below are the seam with Stage 2. When the database
   arrives they move to src/lib/queries/ with identical signatures, and no
   component that calls them needs to change. */

export function getPublishedArticles(): readonly Article[] {
  return sampleArticles
    .filter((a) => a.status === "published")
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticleBySlug(slug: string): Article | undefined {
  return sampleArticles.find((a) => a.slug === slug && a.status === "published");
}

export function getArticlesByAuthor(slug: string): readonly Article[] {
  return getPublishedArticles().filter((a) => a.author.slug === slug);
}
