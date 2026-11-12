import { Badge } from "@/common/components/ui/badge";

import { type AccessLevel } from "../../../viewmodels/member-role";

const VARIANT = {
  EDITORSHIP: "brand",
  EDITOR: "info",
  NONE: "neutral",
  ALUMNI: "outline",
} as const satisfies Record<AccessLevel, Badge.Props["variant"]>;

export function AccessBadge({ level, label, className }: AccessBadge.Props) {
  return (
    <Badge variant={VARIANT[level]} className={className}>
      {label}
    </Badge>
  );
}

export namespace AccessBadge {
  export type Props = {
    level: AccessLevel;
    /** From `getAccessLabels(t)`. */
    label: string;
    className?: string;
  };
}
