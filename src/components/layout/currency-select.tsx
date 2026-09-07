"use client";

import { Coins } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { CURRENCIES, SUPPORTED_CURRENCIES, type CurrencyCode } from "@/config/currencies";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils/cn";

export function CurrencySelect({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
      <SelectTrigger
        aria-label="Display currency"
        className={cn("h-9 w-auto gap-1.5 rounded-full border-line px-3 text-sm", className)}
      >
        <Coins className="size-4 text-ink-subtle" aria-hidden="true" />
        <span className="font-medium">{currency}</span>
      </SelectTrigger>
      <SelectContent className="min-w-56">
        {SUPPORTED_CURRENCIES.map((code) => (
          <SelectItem key={code} value={code}>
            <span className="flex w-full items-center gap-2">
              <span className="w-9 font-medium">{code}</span>
              <span className="text-ink-muted">{CURRENCIES[code].label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
