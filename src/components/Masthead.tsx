import Image from "next/image";
import Link from "next/link";
import { AccountControl } from "@/components/AccountControl";
import { Dateline } from "@/components/Dateline";
import { nav, site } from "@/lib/site";

export function Masthead() {
  return (
    <header className="border-ink border-b">
      <div className="mx-auto w-full max-w-(--page) px-5">
        <div className="label border-rule text-ink-faint flex items-center justify-between gap-4 border-b py-2">
          <Dateline />
          <AccountControl />
        </div>

        <div className="py-7 text-center sm:py-9">
          <Link href="/" className="inline-block">
            {/* The mark is line art on a cream ground. Multiply blending lets that
                ground disappear into the paper instead of sitting on it as a square. */}
            <Image
              src="/logo.png"
              alt=""
              width={72}
              height={72}
              priority
              className="mx-auto mb-1 h-14 w-14 mix-blend-multiply sm:h-16 sm:w-16"
            />
            <span className="font-display block text-5xl leading-none font-semibold tracking-[-0.02em] sm:text-7xl">
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
