import { Badge } from "@/common/components/ui/badge";
import { getCategoryBadgeVariant } from "@/features/category/viewmodels";

export function CategoryBadge({ category, className }: CategoryBadge.Props) {
  return (
    <Badge
      label={category}
      variant={getCategoryBadgeVariant(category)}
      className={className}
    />
  );
}

export namespace CategoryBadge {
  export type Props = {
    category: string;
    className?: string;
  };
}
