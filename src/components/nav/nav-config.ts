import { Info, Search, Store, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Is this tab the current section? */
  isActive: (pathname: string) => boolean;
}

// Three sections only. "Search" covers the home page and search results,
// because both are where you look for a medicine.
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Search",
    icon: Search,
    isActive: (p) => p === "/" || p.startsWith("/search"),
  },
  {
    href: "/pharmacies",
    label: "Pharmacies",
    icon: Store,
    isActive: (p) => p.startsWith("/pharmacies"),
  },
  {
    href: "/about",
    label: "About",
    icon: Info,
    isActive: (p) => p.startsWith("/about"),
  },
];
