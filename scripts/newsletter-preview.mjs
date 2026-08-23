import "dotenv/config";

/**
 * Composes the next issue and prints it, without sending anything.
 *
 * A script rather than a curl one-liner because the one-liner differs between
 * PowerShell and a POSIX shell, and getting it wrong looks like the endpoint is
 * broken when it is only the quoting.
 *
 *   npm run newsletter:preview            against the local dev server
 *   npm run newsletter:preview -- --days=400
 *   npm run newsletter:preview -- --url=https://theparallaxer.com
 */

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? "true"];
  }),
);

const base = (args.url ?? "http://localhost:3000").replace(/\/+$/, "");
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET is not set in .env, so the endpoint would refuse the request.");
  process.exit(1);
}

const url = new URL(`${base}/api/newsletter/send`);
url.searchParams.set("dry", "1");
if (args.days) url.searchParams.set("days", args.days);

let response;
try {
  response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });
} catch (cause) {
  console.error(`Could not reach ${base}.`);
  console.error(base.includes("localhost") ? "Is `npm run dev` running?" : String(cause));
  process.exit(1);
}

const body = await response.json().catch(() => null);

if (!response.ok) {
  console.error(`${response.status}: ${body?.error ?? "no reason given"}`);
  if (response.status === 401) {
    console.error("The CRON_SECRET here does not match the one the server was started with.");
  }
  process.exit(1);
}

if (body.status !== "dry run, nothing sent") {
  console.log(body.status === "nothing to send" ? "Nothing new since the last issue." : body.status);
  console.log("Pass --days=400 to preview against the whole archive.");
  process.exit(0);
}

console.log(`Issue ${body.issueNumber}: ${body.subject}`);
console.log(
  body.mailConfigured
    ? "Mail is configured, so a real send would go out."
    : "RESEND_API_KEY is not set here, so a real send would only print to the terminal.",
);
console.log(`\n${"".padEnd(58, "=")}\n`);
console.log(body.preview);
