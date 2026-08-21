/**
 * Limits shared by the profile form and its server action.
 *
 * Kept outside the actions file because a module marked "use server" may only
 * export async functions; a plain constant there is a build error.
 */

export const BIO_MAX = 600;
export const LINKS_MAX = 6;
export const LINK_LABEL_MAX = 40;
