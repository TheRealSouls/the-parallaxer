/**
 * Password rules.
 *
 * Eight characters or more, any characters at all, with at least one letter and
 * at least one digit.
 *
 * Symbols, spaces and accented letters are all accepted. Barring them would
 * shrink the usable character set for no security gain, and rejecting spaces
 * rules out passphrases, which are the easiest strong passwords for a person to
 * actually remember. The length floor does the real work.
 *
 * Shared by the sign-up form, the reset form, and the server hook, so the
 * browser and the server never disagree about what is acceptable. The server
 * check is the one that counts.
 */

export const PASSWORD_MIN = 8;

/**
 * Better Auth rejects anything longer than this before our own hook sees it, so
 * the limit is repeated here to produce a readable message rather than an
 * opaque server error.
 */
export const PASSWORD_MAX = 128;

const HAS_LETTER = /\p{L}/u;
const HAS_DIGIT = /\p{Nd}/u;

export const PASSWORD_HINT =
  "At least 8 characters, including at least one letter and one number. Symbols and spaces are welcome.";

/** Null when the password is acceptable, otherwise a message to show. */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN) {
    return `Passwords are at least ${PASSWORD_MIN} characters.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Passwords are at most ${PASSWORD_MAX} characters.`;
  }
  if (!HAS_LETTER.test(password) || !HAS_DIGIT.test(password)) {
    return "Include at least one letter and at least one number.";
  }
  return null;
}
