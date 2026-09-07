"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Sheet — a Radix dialog anchored to an edge. Used for the mobile navigation
 * drawer and for the mobile filter bottom sheet, so both get focus trapping,
 * escape handling and scroll locking for free.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  title,
  description,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "right" | "left" | "bottom";
  title: string;
  description?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col bg-canvas shadow-float focus:outline-none",
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          side === "right" &&
            "inset-y-0 right-0 w-[min(22rem,92vw)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "left" &&
            "inset-y-0 left-0 w-[min(22rem,92vw)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[88vh] rounded-t-panel data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <DialogPrimitive.Title className="text-base font-semibold text-ink">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            aria-label="Close"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description
          className={description ? "px-5 pt-3 text-sm text-ink-muted" : "sr-only"}
        >
          {description ?? title}
        </DialogPrimitive.Description>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
