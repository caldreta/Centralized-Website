import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/logo";
import { NavLinks, NavLinksFallback } from "@/components/nav/nav-links";

export function SiteHeader() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Logo className="size-8" />
            <span className="text-lg">PharmaLink</span>
          </Link>

          {/* Desktop / tablet: tabs in the header */}
          <nav aria-label="Main" className="hidden sm:block">
            <Suspense fallback={<NavLinksFallback variant="top" />}>
              <NavLinks variant="top" />
            </Suspense>
          </nav>
        </div>
      </header>

      {/* Phone: tabs in a bottom bar, within thumb reach */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
      >
        <Suspense fallback={<NavLinksFallback variant="bottom" />}>
          <NavLinks variant="bottom" />
        </Suspense>
      </nav>
    </>
  );
}
