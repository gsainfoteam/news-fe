import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/common/lib/cn";

export const alertVariants = cva(
  "flex w-full items-start gap-3 rounded-lg border border-transparent px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface [&>svg]:text-muted-foreground",
        info: "bg-info-soft [&>svg]:text-info",
        success: "bg-success-soft [&>svg]:text-success",
        warning: "bg-warning-soft [&>svg]:text-warning",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export function Alert({ className, variant, ...props }: Alert.Props) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export namespace Alert {
  export type Props = React.ComponentProps<"div"> &
    VariantProps<typeof alertVariants>;
}

export function AlertContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-semibold", className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "[&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-2",
        className,
      )}
      {...props}
    />
  );
}
