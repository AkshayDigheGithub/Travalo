"use client";

import { Languages } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { DEFAULT_LOCALE, LOCALES } from "@/config/locales";
import { cn } from "@/lib/utils/cn";

/**
 * The interface currently ships in English only. The control is here because
 * the locale list is config-driven — adding a translation adds an option.
 */
export function LanguageSelect({ className }: { className?: string }) {
  return (
    <Select defaultValue={DEFAULT_LOCALE}>
      <SelectTrigger
        aria-label="Language"
        className={cn("h-9 w-auto gap-1.5 rounded-full border-line px-3 text-sm", className)}
      >
        <Languages className="size-4 text-ink-subtle" aria-hidden="true" />
        <span className="font-medium">
          {LOCALES.find((locale) => locale.code === DEFAULT_LOCALE)?.short}
        </span>
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((locale) => (
          <SelectItem key={locale.code} value={locale.code}>
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
