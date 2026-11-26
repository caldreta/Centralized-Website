import Link from "next/link";

import { Logo } from "@/components/logo";

const NAV = [
  { href: "/search", label: "Find medicine" },
  { href: "/pharmacies", label: "Pharmacies" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo className="size-7" />
          <span className="hidden text-lg min-[420px]:inline">PharmaLink</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
