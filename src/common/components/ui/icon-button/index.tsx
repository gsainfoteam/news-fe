import { Icon } from "@/common/components/ui/icon";
import { cn } from "@/common/lib";

export function IconButton({
  icon,
  label,
  href,
  className,
  iconClassName = "size-6 text-neutral-600",
}: IconButton.Props) {
  const baseClass = href
    ? "flex items-center justify-center rounded-xl transition-colors"
    : "rounded-xl p-2 transition-colors hover:bg-neutral-100";
  const content = <Icon name={icon} className={iconClassName} />;

  return href ? (
    <a href={href} className={cn(baseClass, className)} aria-label={label}>
      {content}
    </a>
  ) : (
    <button className={cn(baseClass, className)} aria-label={label}>
      {content}
    </button>
  );
}

export namespace IconButton {
  export type Props = {
    icon: Icon.Name;
    label: string;
    href?: string;
    className?: string;
    iconClassName?: string;
  };
}
