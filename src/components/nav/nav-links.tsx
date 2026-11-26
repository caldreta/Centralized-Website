"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "./nav-config";

type Variant = "top" | "bottom";

/** Highlights the current section. Must be rendered inside <Suspense>. */
export function NavLinks({ variant }: { variant: Variant }) {
  const pathname = usePathname();
  return <NavList variant={variant} pathname={pathname} />;
}

/** Same links without a highlighted tab, shown while the page URL resolves. */
export function NavLinksFallback({ variant }: { variant: Variant }) {
  return <NavList variant={variant} pathname={null} />;
}

function NavList({ variant, pathname }: { variant: Variant; pathname: string | null }) {
  return (
    <ul className={cn(variant === "top" ? "flex items-center gap-1" : "grid grid-cols-3")}>
      {NAV_ITEMS.map((item) => {
        const active = pathname !== null && item.isActive(pathname);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                variant === "top"
                  ? "gap-2 rounded-full px-4 py-2 text-sm font-medium"
                  : "flex-col justify-center gap-0.5 py-2 text-[11px] font-medium",
                active
                  ? variant === "top"
                    ? "bg-brand-soft text-primary"
                    : "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                variant === "top" && !active && "hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "grid place-items-center",
                  variant === "bottom" && "h-7 w-12 rounded-full transition-colors",
                  variant === "bottom" && active && "bg-brand-soft",
                )}
              >
                <Icon aria-hidden="true" className={variant === "top" ? "size-4" : "size-5"} />
              </span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
