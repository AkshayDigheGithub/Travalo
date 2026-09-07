/**
 * Display languages. English is the only one the content is written in today;
 * the list exists so adding a locale is a data change, not a refactor.
 */
export const LOCALES = [{ code: "en", label: "English", short: "EN" }] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
