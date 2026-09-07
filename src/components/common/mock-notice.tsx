import { FlaskConical } from "lucide-react";

/**
 * Shown whenever results came from the development provider, so sample data is
 * never mistaken for live prices.
 */
export function MockDataNotice({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border border-accent-500/30 bg-accent-50 px-4 py-3 text-sm text-ink ${className ?? ""}`}
      role="status"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden="true" />
      <p>
        <span className="font-medium">Sample data.</span> This deployment is running in development
        mode, so these results are illustrative examples — not live prices or availability.
      </p>
    </div>
  );
}
