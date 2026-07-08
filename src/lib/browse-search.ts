import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

/**
 * Shared browse/search filters that persist across the browse → profile →
 * booking flow via URL search params.
 *
 * - `country` — ISO 3166-1 alpha-2 code, "" = all countries.
 * - `category` — "all" | "woman" | "trans-woman" (validated in components).
 */
export const browseSearchSchema = z.object({
  country: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "all").default("all"),
});

export const browseSearchValidator = zodValidator(browseSearchSchema);

export type BrowseSearch = { country: string; category: string };

export const CATEGORY_IDS = ["all", "woman", "trans-woman"] as const;

export function safeCategory(value: string): "all" | "woman" | "trans-woman" {
  return (CATEGORY_IDS as readonly string[]).includes(value)
    ? (value as "all" | "woman" | "trans-woman")
    : "all";
}
