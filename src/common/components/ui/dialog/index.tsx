import * as React from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/common/lib/cn";

export const dialogOverlayClass =
  "fixed inset-0 isolate z-50 bg-overlay duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";
export const dialogPopupClass =
  "fixed top-1/2 left-1/2 z-50 flex w-[420px] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 overflow-y-auto max-h-[calc(100dvh-2rem)] rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-lg duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";
export const dialogTitleClass = "text-h3";
export const dialogDescriptionClass = "text-sm text-muted-foreground";
export const dialogFooterClass = "mt-2 flex flex-wrap justify-end gap-2";

export function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogContent({
  className,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-overlay"
        className={dialogOverlayClass}
      />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(dialogPopupClass, className)}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(dialogFooterClass, className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(dialogTitleClass, className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(dialogDescriptionClass, className)}
      {...props}
    />
  );
}
