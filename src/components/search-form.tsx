import { Search } from "lucide-react";
import Form from "next/form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchForm({
  defaultValue = "",
  size = "default",
  autoFocus = false,
  className,
}: {
  defaultValue?: string;
  size?: "default" | "lg";
  autoFocus?: boolean;
  className?: string;
}) {
  const lg = size === "lg";
  return (
    <Form action="/search" role="search" className={cn("flex w-full gap-2", className)}>
      <label htmlFor="medicine-search" className="sr-only">
        Medicine name
      </label>
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground",
            lg ? "size-5" : "size-4",
          )}
        />
        <input
          id="medicine-search"
          name="q"
          type="search"
          required
          minLength={2}
          maxLength={60}
          autoComplete="off"
          autoFocus={autoFocus}
          defaultValue={defaultValue}
          placeholder="Search a medicine, e.g. Paracetamol or Biogesic"
          className={cn(
            "w-full rounded-lg border border-input bg-background pr-3 shadow-xs outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
            lg ? "h-12 pl-10 text-base" : "h-10 pl-9 text-sm",
          )}
        />
      </div>
      <Button type="submit" className={lg ? "h-12 px-5 text-base" : "h-10 px-4"}>
        Search
      </Button>
    </Form>
  );
}
