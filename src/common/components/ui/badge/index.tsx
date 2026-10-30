import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/common/lib/cn";

export const badgeVariants = cva(
  "inline-flex h-[22px] w-fit shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 text-2xs leading-none font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        brand: "bg-brand-soft text-brand-text",
        info: "bg-info-soft text-info",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        outline: "border-border bg-transparent text-muted-foreground",
        solid: "bg-foreground text-background",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export function Badge({ className, variant, render, ...props }: Badge.Props) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant }), className) },
      props,
    ),
    render,
    state: { slot: "badge", variant },
  });
}

export namespace Badge {
  export type Props = useRender.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants>;
}
