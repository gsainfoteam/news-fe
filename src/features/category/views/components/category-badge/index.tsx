import { useTranslation } from "react-i18next";

import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/cn";

import { type Category } from "../../../models";
import { getCategoryLabels } from "../../../viewmodels/category";

export function CategoryBadge({
  category,
  kicker,
  className,
}: CategoryBadge.Props) {
  const { t } = useTranslation();
  const label = getCategoryLabels(t)[category];
  if (kicker) {
    return (
      <span className={cn("text-xs font-bold text-brand-text", className)}>
        {label}
      </span>
    );
  }
  return (
    <Badge variant="brand" className={className}>
      {label}
    </Badge>
  );
}

export namespace CategoryBadge {
  export type Props = {
    category: Category;
    /** Plain brand text above article titles in cards (design "kicker"). */
    kicker?: boolean;
    className?: string;
  };
}
