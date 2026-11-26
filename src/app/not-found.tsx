import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page or pharmacy you’re looking for doesn’t exist or is no longer listed.
      </p>
      <Link href="/" className={buttonVariants()}>
        Back to search
      </Link>
    </div>
  );
}
