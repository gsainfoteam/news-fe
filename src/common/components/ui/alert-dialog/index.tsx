import * as React from "react";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { Button } from "@/common/components/ui/button";
import {
  dialogDescriptionClass,
  dialogFooterClass,
  dialogOverlayClass,
  dialogPopupClass,
  dialogTitleClass,
} from "@/common/components/ui/dialog";
import { cn } from "@/common/lib/cn";

export function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

export function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

export function AlertDialogContent({
  className,
  ...props
}: AlertDialogPrimitive.Popup.Props) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop
        data-slot="alert-dialog-overlay"
        className={dialogOverlayClass}
      />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(dialogPopupClass, className)}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(dialogFooterClass, className)}
      {...props}
    />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(dialogTitleClass, className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(dialogDescriptionClass, className)}
      {...props}
    />
  );
}

export function AlertDialogAction(props: Button.Props) {
  return <Button data-slot="alert-dialog-action" {...props} />;
}

export function AlertDialogCancel({
  variant = "outline",
  size,
  ...props
}: AlertDialogCancel.Props) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  );
}

export namespace AlertDialogCancel {
  export type Props = AlertDialogPrimitive.Close.Props &
    Pick<Button.Props, "variant" | "size">;
}
