import * as React from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/common/lib/cn";

// The caller passes `aria-label`: ui/ can't translate.
export function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="pagination"
      className={cn("flex w-full justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

export function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

export function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLink.Props) {
  return (
    <a
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-[38px] min-w-[38px] items-center justify-center rounded-md px-1.5 text-sm font-semibold text-muted-foreground transition-colors outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:pointer-events-none aria-disabled:opacity-35 aria-[current=page]:bg-foreground aria-[current=page]:text-background [&_svg]:size-4.5",
        className,
      )}
      {...props}
    />
  );
}

export namespace PaginationLink {
  export type Props = React.ComponentProps<"a"> & { isActive?: boolean };
}

export namespace PaginationIconLink {
  export type Props = PaginationLink.Props & { "aria-label": string };
}

// Icon-only, so the translated `aria-label` ("이전 페이지") is required.
export function PaginationPrevious(props: PaginationIconLink.Props) {
  return (
    <PaginationLink {...props}>
      <ChevronLeftIcon aria-hidden="true" />
    </PaginationLink>
  );
}

export function PaginationNext(props: PaginationIconLink.Props) {
  return (
    <PaginationLink {...props}>
      <ChevronRightIcon aria-hidden="true" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-[38px] items-center justify-center text-subtle-foreground [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
    </span>
  );
}
