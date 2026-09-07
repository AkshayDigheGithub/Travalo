import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        This page doesn&apos;t exist
      </h1>
      <p className="max-w-md text-ink-muted">
        The link may be out of date, or the page may have moved. Start a new search instead.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/flights">Search flights</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/hotels">Search hotels</Link>
        </Button>
      </div>
    </div>
  );
}
