import { CATEGORIES } from "@/lib/categories";
import { TIERS, DELIVERY_OPTIONS, ADDONS } from "@/lib/pricing";

export const categoryLabel = (id: string): string =>
  CATEGORIES.find((c) => c.id === id)?.name ?? id;

export const tierLabel = (id: number): string => {
  const t = TIERS.find((x) => x.id === id);
  return t ? `${t.name} — ${t.tagline}` : `Tier ${id}`;
};

export const deliveryLabel = (id: string): string =>
  DELIVERY_OPTIONS.find((d) => d.id === id)?.name ?? id;

export const addonLabels = (ids: unknown): string[] =>
  Array.isArray(ids)
    ? ids.map((i) => ADDONS.find((a) => a.id === i)?.name ?? String(i))
    : [];
