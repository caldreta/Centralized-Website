import Link from "next/link";

import { Logo } from "@/components/logo";
import { NAV_ITEMS } from "@/components/nav/nav-config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-[1fr_auto]">
        <div className="max-w-xl space-y-2">
          <p className="flex items-center gap-2 font-semibold">
            <Logo className="size-6" /> PharmaLink
          </p>
          <p className="text-muted-foreground">
            Stock is reported by each participating pharmacy and can change before you arrive.
            For urgent needs, call ahead. PharmaLink does not sell medicines, take orders or
            accept payments.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex gap-4 sm:flex-col sm:gap-2 sm:text-right">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-6 text-xs text-muted-foreground">
        Lyceum of the Philippines University – Cavite · Pilot: Trece Martires, Tanza and General
        Trias · Map © OpenStreetMap contributors
      </p>
    </footer>
  );
}
