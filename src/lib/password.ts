/**
 * Password rules.
 *
 * Eight characters or more, letters and digits only, with at least one of each.
 *
 * Worth recording the trade-off: barring symbols shrinks the character set from
 * 94 to 62, and barring spaces rules out passphrases, which are the easiest
 * strong passwords for a person to remember. The rule is a deliberate choice for
 * a simpler sign-up, not a security improvement, and the length floor is doing
 * most of the real work.
 *
 * Shared by the sign-up form, the reset form, and the server hook, so the
 * browser and the server never disagree about what is acceptable. The server
 * check is the one that counts.
 */

export const PASSWORD_MIN = 8;

const ALPHANUMERIC_ONLY = /^[a-zA-Z0-9]+$/;
const HAS_LETTER = /[a-zA-Z]/;
const HAS_DIGIT = /[0-9]/;

export const PASSWORD_HINT =
  "At least 8 characters, letters and numbers only, including at least one of each.";

/** Null when the password is acceptable, otherwise a message to show. */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN) {
    return `Passwords are at least ${PASSWORD_MIN} characters.`;
  }
  if (!ALPHANUMERIC_ONLY.test(password)) {
    return "Use letters and numbers only.";
  }
  if (!HAS_LETTER.test(password) || !HAS_DIGIT.test(password)) {
    return "Include at least one letter and at least one number.";
  }
  return null;
}
