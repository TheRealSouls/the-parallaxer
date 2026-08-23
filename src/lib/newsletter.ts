import "server-only";

import type { Article } from "@/lib/content";
import { prisma } from "@/lib/db";
import { DISPLAY_REGIONS, REGIONS, toRegionCode, type RegionCode } from "@/lib/lenses";
import { mailOrigin, sendBatch, type Mail } from "@/lib/mail";
import { getPublishedArticles } from "@/lib/data";
import { site } from "@/lib/site";

/**
 * The weekly digest.
 *
 * Composed from whatever has been published since the last issue went out, so
 * missing a week folds into the next one rather than losing those articles. If
 * no issue has ever been sent it falls back to the last seven days, which stops
 * a first send mailing the entire archive.
 *
 * Grouped by region in the same order the site lists them, because the whole
 * premise is that where a piece sits between the three lenses is the first
 * useful thing to know about it.
 */

/** Nothing is sent for an empty week. Silence is better than a digest of nothing. */
export type Issue = {
  number: number;
  subject: string;
  articles: readonly Article[];
  since: Date;
};

export async function buildIssue(options?: { days?: number }): Promise<Issue | null> {
  const last = await prisma.newsletterIssue.findFirst({
    where: { sentAt: { not: null } },
    orderBy: { number: "desc" },
    select: { number: true, sentAt: true },
  });

  // `days` widens the window on purpose, and only the dry run passes it. It
  // exists so a first issue can be previewed against an archive that is older
  // than a week, which is otherwise impossible to look at before sending one.
  const since =
    options?.days != null
      ? new Date(Date.now() - options.days * 86_400_000)
      : (last?.sentAt ?? new Date(Date.now() - 7 * 86_400_000));

  const articles = (await getPublishedArticles()).filter(
    (article) => new Date(article.publishedAt) > since,
  );

  if (articles.length === 0) return null;

  const number = (last?.number ?? 0) + 1;
  const lead = articles[0]!;
  const subject =
    articles.length === 1
      ? `${site.name}: ${lead.title}`
      : `${site.name}: ${lead.title}, and ${articles.length - 1} more`;

  // Oldest first, so the issue reads in the order the week happened.
  return { number, subject, articles: articles.slice().reverse(), since };
}

/**
 * The body of one subscriber's copy.
 *
 * Standfirsts and links only, never the article itself. A newsletter that
 * reprints the piece gives nobody a reason to visit, and the whole point of the
 * list is to bring people back to the site.
 */
export function renderIssue(issue: Issue, unsubscribeToken: string): string {
  const byRegion = new Map<RegionCode, Article[]>();
  for (const article of issue.articles) {
    const code = toRegionCode(article.lenses);
    byRegion.set(code, [...(byRegion.get(code) ?? []), article]);
  }

  const sections: string[] = [];
  for (const region of DISPLAY_REGIONS) {
    const group = byRegion.get(region.code);
    if (!group?.length) continue;

    sections.push(REGIONS[region.code].name.toUpperCase());
    sections.push("");

    for (const article of group) {
      sections.push(`  ${article.title}`);
      if (article.dek) sections.push(`  ${article.dek}`);
      sections.push(`  ${mailOrigin}/article/${article.slug}`);
      sections.push(`  ${article.author.name} · ${article.readingMinutes} min`);
      sections.push("");
    }
  }

  const count = issue.articles.length;

  return [
    `${site.name}`,
    site.statement,
    "",
    `Issue ${issue.number}. ${count} ${count === 1 ? "piece" : "pieces"} since the last one.`,
    "",
    "".padEnd(58, "-"),
    "",
    ...sections,
    "".padEnd(58, "-"),
    "",
    `Read everything at ${mailOrigin}`,
    "",
    "You are receiving this because you confirmed your address.",
    `Unsubscribe in one click: ${mailOrigin}/newsletter/unsubscribe?token=${unsubscribeToken}`,
  ].join("\n");
}

export type SendReport = {
  issueNumber: number;
  articles: number;
  recipients: number;
  sent: number;
  failed: { to: string; reason: string }[];
};

/**
 * Sends the issue to every confirmed, still-subscribed address.
 *
 * The issue row is written before anything goes out and stamped `sentAt` only
 * once it has. A crash halfway therefore leaves an unstamped row, which is
 * visible, rather than an issue that appears to have been sent and was not.
 */
export async function sendIssue(issue: Issue): Promise<SendReport> {
  const subscribers = await prisma.subscriber.findMany({
    where: { confirmedAt: { not: null }, unsubscribedAt: null },
    select: { email: true, token: true },
  });

  const record = await prisma.newsletterIssue.create({
    data: {
      number: issue.number,
      subject: issue.subject,
      articleSlugs: issue.articles.map((article) => article.slug),
      recipientCount: subscribers.length,
    },
    select: { id: true },
  });

  const messages: Mail[] = subscribers.map((subscriber) => ({
    to: subscriber.email,
    subject: issue.subject,
    text: renderIssue(issue, subscriber.token),
    headers: {
      // Lets a mail client offer its own unsubscribe button, which people reach
      // for instead of the spam button. Nothing protects deliverability more.
      "List-Unsubscribe": `<${mailOrigin}/newsletter/unsubscribe?token=${subscriber.token}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  }));

  const result = await sendBatch(messages);

  await prisma.newsletterIssue.update({
    where: { id: record.id },
    data: { sentAt: new Date() },
  });

  return {
    issueNumber: issue.number,
    articles: issue.articles.length,
    recipients: subscribers.length,
    sent: result.sent,
    failed: result.failed,
  };
}
