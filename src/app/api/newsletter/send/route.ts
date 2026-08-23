import { NextResponse } from "next/server";
import { buildIssue, renderIssue, sendIssue } from "@/lib/newsletter";
import { mailConfigured } from "@/lib/mail";

/**
 * Sends the weekly digest. Called by a scheduler, never by a reader.
 *
 * Protected by a shared secret rather than a session, because the caller is a
 * cron job with no account. Without CRON_SECRET set the endpoint refuses
 * outright: an unprotected route that mails every subscriber is worse than one
 * that does not work.
 *
 *   curl -X POST https://.../api/newsletter/send \
 *        -H "authorization: Bearer $CRON_SECRET"
 *
 * Add ?dry=1 to compose the issue and return it without sending, which is how
 * to check what a send would contain before committing to it. A dry run may
 * also pass &days=N to widen the window, so a first issue can be previewed
 * against an archive older than a week.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not set, so sending is disabled." },
      { status: 503 },
    );
  }

  const offered = request.headers.get("authorization");
  if (offered !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const dry = params.get("dry");

  // Only a dry run may reach further back than the last issue. A real send is
  // always the window since the last one, so no scheduler misconfiguration can
  // mail the entire archive to everybody.
  const days = dry ? Number(params.get("days")) : NaN;

  const issue = await buildIssue(Number.isFinite(days) && days > 0 ? { days } : undefined);
  if (!issue) {
    // Not an error. A quiet week should send nothing rather than a digest of
    // nothing, and the scheduler should not treat that as a failure.
    return NextResponse.json({ status: "nothing to send", articles: 0 });
  }

  if (dry) {
    return NextResponse.json({
      status: "dry run, nothing sent",
      mailConfigured,
      issueNumber: issue.number,
      subject: issue.subject,
      articles: issue.articles.map((article) => article.title),
      preview: renderIssue(issue, "EXAMPLE_TOKEN"),
    });
  }

  const report = await sendIssue(issue);
  return NextResponse.json({ status: "sent", mailConfigured, ...report });
}
