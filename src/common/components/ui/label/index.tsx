import * as React from "react";

import { cn } from "@/common/lib/cn";

export function Label({ className, ...props }: Label.Props) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-[1.4] font-semibold text-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export namespace Label {
  export type Props = React.ComponentProps<"label">;
}
