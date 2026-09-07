import { Skeleton } from "@/components/ui/skeleton";

export function FlightCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="mt-5 flex items-center gap-6">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-px flex-1" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:flex-row">
      <Skeleton className="h-44 w-full rounded-xl sm:h-40 sm:w-60" />
      <div className="flex-1 space-y-3 py-1">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="space-y-6 rounded-panel border border-line bg-surface p-5">
      {[0, 1, 2].map((group) => (
        <div key={group} className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      ))}
    </div>
  );
}

/**
 * Search progress copy. Deliberately neutral: we don't claim a number of
 * providers or options that the underlying search doesn't actually cover.
 */
export function SearchProgress({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-brand-600" />
      </span>
      <p className="text-sm text-ink-muted" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
