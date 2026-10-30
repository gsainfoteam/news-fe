import * as React from "react";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/common/lib/cn";

export function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

export function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "scrollbar-none flex gap-1 overflow-x-auto border-b border-border",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "-mb-px shrink-0 border-b-3 border-transparent px-3.5 py-3 text-[15px] leading-normal font-semibold whitespace-nowrap text-subtle-foreground transition-colors outline-none first:pl-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-active:border-primary data-active:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsCount({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tabs-count"
      className={cn(
        "ml-1 text-xs font-medium text-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}
