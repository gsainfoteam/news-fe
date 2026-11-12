import * as React from "react";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/common/lib/cn";

// Only the multi-select (chips) parts are kept: the single-value input from
// the registry needs an input-group primitive nothing else uses.
export const Combobox = ComboboxPrimitive.Root;

export function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1.5 text-sm transition-colors focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring has-aria-invalid:border-destructive-text",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxChip({
  className,
  children,
  removeLabel,
  ...props
}: ComboboxChip.Props) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-7 w-fit items-center gap-1.5 rounded-full bg-muted pr-1 pl-1 text-xs font-semibold whitespace-nowrap text-foreground outline-none data-highlighted:ring-2 data-highlighted:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ChipRemove
        data-slot="combobox-chip-remove"
        aria-label={removeLabel}
        className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-3"
      >
        <XIcon />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  );
}

export namespace ComboboxChip {
  export type Props = ComboboxPrimitive.Chip.Props & {
    /** Accessible name of the remove button, e.g. "김도윤 빼기". */
    removeLabel: string;
  };
}

export function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn(
        "h-7 min-w-20 flex-1 bg-transparent px-1.5 text-sm text-foreground outline-none placeholder:text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxContent.Props) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

export namespace ComboboxContent {
  export type Props = ComboboxPrimitive.Popup.Props &
    Pick<
      ComboboxPrimitive.Positioner.Props,
      "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
    >;
}

export function ComboboxList({
  className,
  ...props
}: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "max-h-[min(18rem,calc(var(--available-height)-0.5rem))] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 data-empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

export function ComboboxEmpty({
  className,
  ...props
}: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center px-3 py-3 text-center text-sm text-subtle-foreground group-data-empty/combobox-content:flex",
        className,
      )}
      {...props}
    />
  );
}

export function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}
