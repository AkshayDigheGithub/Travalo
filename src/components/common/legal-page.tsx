import type { ReactNode } from "react";

/** Shared shell for the legal pages, with the review notice they all need. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="container-page max-w-3xl py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-subtle">Last updated {updated}</p>

      <div
        role="note"
        className="mt-6 rounded-xl border border-accent-500/30 bg-accent-50 px-4 py-3 text-sm text-ink"
      >
        <strong className="font-semibold">Placeholder text pending legal review.</strong> This page
        describes how the product is intended to work. It has not been reviewed by a lawyer and is
        not a legal document. Replace it with reviewed wording before launch.
      </div>

      <div className="mt-8 space-y-8 leading-relaxed text-ink-muted [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:my-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
