import Link from "next/link";

import { footerNav, siteConfig } from "@/config/site";
import { CurrencySelect } from "./currency-select";
import { LanguageSelect } from "./language-select";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page py-12 pb-28 md:pb-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <CurrencySelect />
              <LanguageSelect />
            </div>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-xs font-semibold tracking-wide text-ink uppercase">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-ink-muted transition-colors hover:text-brand-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {siteConfig.founded} {siteConfig.name}. All rights reserved.
          </p>
          <p className="max-w-xl sm:text-right">
            {siteConfig.name} is a travel search service. Bookings are completed on partner sites,
            and we may earn a commission when you book through a link on this site.
          </p>
        </div>
      </div>
    </footer>
  );
}
