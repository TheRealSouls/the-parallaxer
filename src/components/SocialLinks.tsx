import {
  faInstagram,
  faLinkedinIn,
  faSubstack,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { socials, type SocialKey } from "@/lib/site";

/**
 * Social accounts in the footer.
 *
 * The glyphs are inlined from the icon package rather than drawn by the Font
 * Awesome kit script. The footer is server rendered and part of every page, and
 * a row of icons that pops in a second after the rest of the page has settled
 * looks broken.
 *
 * Each link carries its own accessible name, because a brand glyph on its own
 * tells a screen reader nothing.
 */
const GLYPH: Record<SocialKey, { path: string; width: number }> = {
  linkedin: { path: faLinkedinIn.icon[4] as string, width: faLinkedinIn.icon[0] },
  x: { path: faXTwitter.icon[4] as string, width: faXTwitter.icon[0] },
  instagram: { path: faInstagram.icon[4] as string, width: faInstagram.icon[0] },
  substack: { path: faSubstack.icon[4] as string, width: faSubstack.icon[0] },
};

export function SocialLinks({
  className = "",
  variant = "icons",
}: {
  className?: string;
  /**
   * "icons" is the footer's row of glyphs, where space is short and the
   * accessible name carries the meaning. "list" names each platform in the
   * open, which is what a contact page wants: somebody deciding where to reach
   * you should not have to identify a logo first.
   */
  variant?: "icons" | "list";
}) {
  const list = variant === "list";

  return (
    <ul className={`${list ? "space-y-2.5" : "flex items-center gap-5"} ${className}`}>
      {socials.map((social) => {
        const glyph = GLYPH[social.key];
        return (
          <li key={social.key}>
            <a
              href={social.url}
              rel="noopener"
              className={`text-ink-muted hover:text-ink ${
                list ? "flex items-center gap-2.5 text-base" : "inline-block"
              }`}
            >
              <svg
                viewBox={`0 0 ${glyph.width} 512`}
                className="h-4 w-4 shrink-0 fill-current"
                aria-hidden="true"
              >
                <path d={glyph.path} />
              </svg>
              {list ? (
                <span className="underline-offset-4 hover:underline">{social.label}</span>
              ) : (
                <span className="sr-only">{social.label}</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
