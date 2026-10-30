import * as React from "react";

import { cn } from "@/common/lib/cn";

export function Skeleton({ className, ...props }: Skeleton.Props) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-sm bg-muted", className)}
      {...props}
    />
  );
}

export namespace Skeleton {
  export type Props = React.ComponentProps<"div">;
}
