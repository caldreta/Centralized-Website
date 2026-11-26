import { cn } from "@/lib/utils";

/** Capsule-and-pin mark. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("text-primary", className)}>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <g transform="rotate(-45 16 16)">
        <rect x="9" y="12" width="14" height="8" rx="4" fill="white" />
        <path d="M16 12h3a4 4 0 0 1 0 8h-3z" fill="white" opacity=".55" />
      </g>
    </svg>
  );
}
