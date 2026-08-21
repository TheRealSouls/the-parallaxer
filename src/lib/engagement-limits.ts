/**
 * Limits shared by the comment form and the server action.
 *
 * These live outside the actions file because a module marked "use server" may
 * only export async functions; a plain constant there is a build error.
 */

export const COMMENT_MAX = 2000;

/** Comments allowed per account within the window below. */
export const COMMENT_RATE_LIMIT = 5;
export const COMMENT_RATE_WINDOW_MINUTES = 10;

/**
 * How long an author may edit their own comment.
 *
 * Long enough to fix a typo or a sentence that came out wrong, short enough that
 * nobody can rewrite a remark after people have replied to it.
 */
export const COMMENT_EDIT_GRACE_MINUTES = 15;

/** Sign-ups allowed from one network address within the window below. */
export const SIGNUP_IP_LIMIT = 3;
export const SIGNUP_IP_WINDOW_MINUTES = 60;

/** Comments allowed from one network address within the window below. */
export const COMMENT_IP_LIMIT = 15;
export const COMMENT_IP_WINDOW_MINUTES = 10;
