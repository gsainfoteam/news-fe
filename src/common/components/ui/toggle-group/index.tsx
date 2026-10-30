import * as React from "react";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/common/lib/cn";

const toggleGroupItemVariants = cva(
  "inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap text-muted-foreground transition-colors outline-none focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-sm",
  {
    variants: {
      size: {
        default: "h-[26px] px-2.5 text-2xs",
        lg: "h-8 px-3.5 text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type Size = VariantProps<typeof toggleGroupItemVariants>["size"];

const ToggleGroupContext = React.createContext<Size>("default");

export function ToggleGroup({ className, size, ...props }: ToggleGroup.Props) {
  return (
    <ToggleGroupContext.Provider value={size}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        className={cn(
          "inline-flex w-fit items-center gap-0.5 rounded-full bg-muted p-[3px]",
          className,
        )}
        {...props}
      />
    </ToggleGroupContext.Provider>
  );
}

export namespace ToggleGroup {
  export type Props = ToggleGroupPrimitive.Props & { size?: Size };
}

export function ToggleGroupItem({
  className,
  ...props
}: TogglePrimitive.Props) {
  const size = React.useContext(ToggleGroupContext);
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(toggleGroupItemVariants({ size }), className)}
      {...props}
    />
  );
}
