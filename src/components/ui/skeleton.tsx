import { cn } from "@/lib/utils/cn";

/** Shimmering placeholder used by every loading state. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-shimmer rounded-lg bg-surface-muted", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
