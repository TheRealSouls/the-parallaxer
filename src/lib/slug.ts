/**
 * Slugs.
 *
 * Generated from the headline but editable, because a headline often changes
 * after publication and the URL must not. Once an article is published its slug
 * is frozen: changing it would break every link anyone has shared.
 */

export function slugify(input: string): string {
  return (
    input
      .normalize("NFKD")
      // Strip accents, so "Rawlsian Différance" becomes "rawlsian-differance"
      // rather than losing the words entirely.
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "")
  );
}

/** Appends a counter until the slug is free. `taken` is checked against the database. */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "untitled";
  if (!(await isTaken(root))) return root;

  for (let n = 2; n < 500; n++) {
    const candidate = `${root}-${n}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  // Practically unreachable; a timestamp is still a working URL.
  return `${root}-${Date.now()}`;
}
