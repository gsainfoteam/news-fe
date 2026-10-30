import * as React from "react";

import { ChevronDownIcon } from "lucide-react";

import { inputClassName } from "@/common/components/ui/input";
import { cn } from "@/common/lib/cn";

// A native <select> works in static HTML without hydration and opens the OS
// picker on phones.
export function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span
      data-slot="native-select-wrapper"
      className={cn(
        "relative block has-[select:disabled]:opacity-50",
        className,
      )}
    >
      <select
        data-slot="native-select"
        className={cn(
          inputClassName,
          "appearance-none pr-9 disabled:opacity-100",
        )}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle-foreground"
      />
    </span>
  );
}

// Canvas colors keep the OS dropdown list readable in both themes.
export function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}
