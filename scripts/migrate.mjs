import { spawnSync } from "node:child_process";

/**
 * Applies pending migrations, but only when there is a database to apply them
 * to.
 *
 * The site is built to run without one: `src/lib/data.ts` falls back to the
 * sample archive when DATABASE_URL is unset. So a build with no database is a
 * legitimate state, and failing it here would make the project impossible to
 * build locally or deploy as a preview.
 *
 * `migrate deploy` rather than `migrate dev`: it only applies migrations that
 * already exist and never generates, prompts, or resets. That is what you want
 * touching a production database.
 */
if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL, so no migrations to run. Serving the sample archive.");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  console.error("\nMigrations failed. The deployment has been stopped rather than");
  console.error("started against a database whose shape does not match the code.");
  process.exit(result.status ?? 1);
}
