import * as React from "react";

import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/common/lib/cn";

export const inputClassName =
  "h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors outline-none placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:outline-3 focus-visible:outline-ring/22 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive-text";

export function Input({ className, icon, ...props }: Input.Props) {
  const input = (
    <InputPrimitive
      data-slot="input"
      className={cn(inputClassName, icon && "pl-[38px]", className)}
      {...props}
    />
  );
  if (!icon) return input;
  return (
    <span className="relative block">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle-foreground [&_svg]:size-4"
      >
        {icon}
      </span>
      {input}
    </span>
  );
}

export namespace Input {
  export type Props = React.ComponentProps<"input"> & {
    icon?: React.ReactNode;
  };
}
