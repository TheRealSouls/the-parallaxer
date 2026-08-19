/**
 * Nickname rules.
 *
 * A nickname is the account's public identity and cannot be changed once set,
 * so the constraints have to be decided before the first account exists rather
 * than tightened afterwards.
 *
 * Shared by the sign-up form and the server action, so the browser and the
 * server always agree on what is acceptable. The server check is the real one.
 */

export const NICKNAME_MIN = 3;
export const NICKNAME_MAX = 24;

/** Letters, digits, underscore and hyphen, starting and ending with a letter or digit. */
const SHAPE = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$/;

/**
 * Names that would collide with a route or impersonate the publication. Checked
 * case-insensitively.
 */
const RESERVED = new Set([
  "admin",
  "administrator",
  "about",
  "account",
  "api",
  "article",
  "by",
  "editor",
  "editors",
  "help",
  "lens",
  "login",
  "logout",
  "masthead",
  "moderator",
  "parallaxer",
  "privacy",
  "root",
  "settings",
  "signin",
  "signup",
  "staff",
  "studio",
  "submit",
  "support",
  "terms",
  "theparallaxer",
  "you",
]);

/** Null when the nickname is acceptable, otherwise a message to show the reader. */
export function validateNickname(raw: string): string | null {
  const value = raw.trim();

  if (value.length < NICKNAME_MIN) {
    return `Nicknames are at least ${NICKNAME_MIN} characters.`;
  }
  if (value.length > NICKNAME_MAX) {
    return `Nicknames are at most ${NICKNAME_MAX} characters.`;
  }
  if (!SHAPE.test(value)) {
    return "Use letters, numbers, hyphens, and underscores, starting and ending with a letter or number.";
  }
  if (RESERVED.has(value.toLowerCase())) {
    return "That nickname is reserved. Please choose another.";
  }
  return null;
}
