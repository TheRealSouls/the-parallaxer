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
