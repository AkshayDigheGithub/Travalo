import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

/** Wordmark. The glyph is a stylised compass needle rather than a stock icon. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white transition-transform duration-200 group-hover:-rotate-12">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none">
          <path
            d="M12 2.5 14.6 9.4 21.5 12 14.6 14.6 12 21.5 9.4 14.6 2.5 12 9.4 9.4Z"
            fill="currentColor"
            opacity="0.35"
          />
          <path d="M16.8 7.2 13.9 13.9 7.2 16.8 10.1 10.1Z" fill="currentColor" />
        </svg>
      </span>
      <span className="text-base font-semibold tracking-tight text-ink sm:text-lg">
        {siteConfig.name}
      </span>
    </Link>
  );
}
