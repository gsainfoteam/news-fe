import * as React from "react";

import { cn } from "@/common/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  className,
  children,
  ...props
}: EmptyState.Props) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="flex size-13 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-4.5">
          {icon}
        </div>
      )}
      <p className="text-sm font-bold">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}

export namespace EmptyState {
  export type Props = Omit<React.ComponentProps<"div">, "title"> & {
    icon?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
  };
}
