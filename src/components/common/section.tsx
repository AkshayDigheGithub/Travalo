import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function Section({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("container-page py-12 sm:py-16", className)}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-ink-muted sm:text-base">{description}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            {action.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
