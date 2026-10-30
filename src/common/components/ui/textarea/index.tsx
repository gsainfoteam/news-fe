import * as React from "react";

import { cn } from "@/common/lib/cn";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "block field-sizing-content min-h-24 w-full resize-y rounded-md border border-input bg-background p-3 text-sm leading-[1.65] text-foreground transition-colors outline-none placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-ring/22 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive-text",
        className,
      )}
      {...props}
    />
  );
}
