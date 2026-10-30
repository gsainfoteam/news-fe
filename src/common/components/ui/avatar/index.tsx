import * as React from "react";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@/common/lib/cn";

export function Avatar({
  className,
  size = "default",
  ...props
}: Avatar.Props) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative inline-flex size-9 shrink-0 overflow-hidden rounded-full bg-muted text-sm font-bold text-muted-foreground select-none data-[size=lg]:size-11 data-[size=lg]:text-base data-[size=sm]:size-7 data-[size=sm]:text-2xs",
        className,
      )}
      {...props}
    />
  );
}

export namespace Avatar {
  export type Props = AvatarPrimitive.Root.Props & {
    size?: "sm" | "default" | "lg";
  };
}

export function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.Image.Props & { alt: string }) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center [&>svg]:size-3/5",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "flex *:data-[slot=avatar]:border-2 *:data-[slot=avatar]:border-background *:data-[slot=avatar]:not-first:-ml-2.5",
        className,
      )}
      {...props}
    />
  );
}
