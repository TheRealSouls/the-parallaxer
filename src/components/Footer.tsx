import Link from "next/link";
import { LENSES, lensName } from "@/lib/lenses";
import { LensPixel } from "@/components/LensPixel";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SocialLinks } from "@/components/SocialLinks";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-ink mt-16 border-t-2">
      <div className="mx-auto grid w-full max-w-(--page) gap-8 px-5 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold">{site.name}</p>
          <p className="text-ink-muted mt-2 max-w-xs text-sm leading-relaxed">{site.statement}</p>
          <div className="max-w-xs">
            <NewsletterForm />
          </div>
        </div>

        <nav aria-label="Sections">
          <h2 className="label text-ink-faint">Sections</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {LENSES.map((lens) => (
              <li key={lens}>
                <Link
                  href={`/lens/${lens}`}
                  className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
                >
                  <LensPixel lenses={[lens]} size="sm" />
                  {lensName(lens)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About this publication">
          <h2 className="label text-ink-faint">Publication</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/about" className="underline-offset-4 hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/submit" className="underline-offset-4 hover:underline">
                Write for us
              </Link>
            </li>
            <li>
              <Link href="/terms" className="underline-offset-4 hover:underline">
                Terms of service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="underline-offset-4 hover:underline">
                Privacy policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-rule border-t">
        <div className="mx-auto flex w-full max-w-(--page) flex-wrap items-center justify-between gap-4 px-5 py-4">
          <p className="label text-ink-faint">
            &copy; {new Date().getFullYear()} {site.name}
          </p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
