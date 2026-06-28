import { Icon } from "@/common/components/ui/icon";
import { cv } from "@/common/lib";

const button = cv({
  base: "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-button transition-colors focus:outline-none",
  variants: {
    variant: {
      primary:
        "border-transparent bg-neutral-800 text-white hover:bg-neutral-900",
      secondary:
        "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
      outline:
        "border-[1.5px] border-neutral-900 bg-neutral-100 text-neutral-900 hover:border-neutral-300 hover:bg-white",
    },
  },
  defaultVariants: { variant: "outline" },
});

export function Button({
  label,
  variant = "outline",
  leftIcon,
  rightIcon,
  href,
  className,
}: Button.Props) {
  const classes = button({ variant, className });
  const content = (
    <>
      {leftIcon && <Icon name={leftIcon} className="size-5" />}
      <span>{label}</span>
      {rightIcon && <Icon name={rightIcon} className="size-5" />}
    </>
  );

  return href ? (
    <a href={href} className={classes}>
      {content}
    </a>
  ) : (
    <button className={classes}>{content}</button>
  );
}

export namespace Button {
  export type Variant = "primary" | "secondary" | "outline";
  export type Props = {
    label: string;
    variant?: Variant;
    leftIcon?: Icon.Name;
    rightIcon?: Icon.Name;
    href?: string;
    className?: string;
  };
}
