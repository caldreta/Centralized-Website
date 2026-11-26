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
    <Form
      action="/search"
      role="search"
      className={cn(
        "flex w-full items-center gap-2 rounded-2xl border bg-card p-1.5 shadow-[0_2px_8px_rgb(15_40_40/0.05)] transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
        className,
      )}
    >
      <label htmlFor="medicine-search" className="sr-only">
        Medicine name
      </label>
      <Search
        aria-hidden="true"
        className={cn("ml-2.5 shrink-0 text-muted-foreground", lg ? "size-5" : "size-4.5")}
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
        placeholder="Medicine name, e.g. Paracetamol"
        className={cn(
          "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
          lg ? "h-11 text-base sm:h-12 sm:text-lg" : "h-10 text-base",
        )}
      />
      <Button
        type="submit"
        className={cn("shrink-0 rounded-xl font-semibold", lg ? "h-11 px-5 text-base sm:h-12 sm:px-6" : "h-10 px-5")}
      >
        Search
      </Button>
    </Form>
  );
}
