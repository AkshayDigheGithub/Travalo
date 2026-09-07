"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import { CurrencySelect } from "./currency-select";
import { LanguageSelect } from "./language-select";
import { Logo } from "./logo";

export function SiteHeader() {
  const pathname = usePathname();
  // Every drawer link is wrapped in SheetClose, so navigating closes it.
  const [open, setOpen] = React.useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-surface-muted text-ink"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <CurrencySelect />
          <LanguageSelect />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-muted md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" title="Menu">
            <nav aria-label="Mobile" className="px-3 py-4">
              <ul className="flex flex-col gap-1">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-surface-muted text-ink"
                            : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-2 flex flex-col gap-3 border-t border-line px-5 py-5">
              <span className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                Preferences
              </span>
              <CurrencySelect className="w-full justify-between rounded-xl" />
              <LanguageSelect className="w-full justify-between rounded-xl" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
