/**
 * The four delivery categories (CLAUDE.md). The platform only needs the
 * customer to pick one when ordering; the actual delivery templates are
 * built separately, outside this codebase.
 */

export type CategoryId = "portfolio" | "restaurant" | "management" | "dashboard";

export interface Category {
  id: CategoryId;
  name: string;
  audience: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "portfolio",
    name: "Portfolio",
    audience: "School & college students",
    blurb:
      "A clean personal site to show your projects, skills, and contact details.",
  },
  {
    id: "restaurant",
    name: "Restaurant ordering",
    audience: "Cloud kitchens",
    blurb:
      "Menu, cart, and online orders that land straight in your kitchen.",
  },
  {
    id: "management",
    name: "Management system",
    audience: "Small vendors",
    blurb:
      "Track inventory, customers, and daily operations from one screen.",
  },
  {
    id: "dashboard",
    name: "Dashboard / custom",
    audience: "Anyone with a specific need",
    blurb: "A bespoke internal tool or dashboard, built to your requirements.",
  },
];
