"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Couldn’t load stock information</h1>
      <p className="text-sm text-muted-foreground">
        The pharmacy database didn’t respond. Please try again in a moment.
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </div>
  );
}
