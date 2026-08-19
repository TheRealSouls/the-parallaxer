import Link from "next/link";
import { Dateline } from "@/components/Dateline";
import { nav, site } from "@/lib/site";

export function Masthead() {
  return (
    <header className="border-ink border-b">
      <div className="mx-auto w-full max-w-(--page) px-5">
        <div className="label border-rule text-ink-faint flex items-baseline justify-between border-b py-2">
          <Dateline />
          <span className="hidden sm:inline">Est. {site.founded}</span>
        </div>

        <div className="py-7 text-center sm:py-9">
          <Link href="/" className="inline-block">
            <span className="font-display text-5xl leading-none font-semibold tracking-[-0.02em] sm:text-7xl">
              {site.name}
            </span>
          </Link>
          <p className="label text-ink-muted mx-auto mt-3 max-w-md">{site.statement}</p>
        </div>

        <nav aria-label="Sections" className="border-ink border-t">
          <ul className="label flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
