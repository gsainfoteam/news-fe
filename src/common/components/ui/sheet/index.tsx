import * as React from "react";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/common/lib/cn";

export function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

export function SheetContent({
  className,
  side = "right",
  ...props
}: SheetContent.Props) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-overlay transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"
      />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col overflow-y-auto bg-background text-foreground shadow-lg transition duration-200 ease-in-out outline-none data-ending-style:opacity-0 data-starting-style:opacity-0",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:w-full data-[side=left]:max-w-sm data-[side=left]:border-r data-[side=left]:data-ending-style:-translate-x-10 data-[side=left]:data-starting-style:-translate-x-10",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:w-full data-[side=right]:max-w-sm data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-10 data-[side=right]:data-starting-style:translate-x-10",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:border-b data-[side=top]:data-ending-style:-translate-y-10 data-[side=top]:data-starting-style:-translate-y-10",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:data-starting-style:translate-y-10",
          className,
        )}
        {...props}
      />
    </SheetPrimitive.Portal>
  );
}

export namespace SheetContent {
  export type Props = SheetPrimitive.Popup.Props & {
    side?: "top" | "right" | "bottom" | "left";
  };
}

export function SheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border pr-2 pl-4",
        className,
      )}
      {...props}
    />
  );
}

export function SheetBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("flex flex-col gap-4 p-4", className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex gap-2 p-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-h4", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
