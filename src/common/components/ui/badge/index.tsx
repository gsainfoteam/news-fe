import { cv } from "@/common/lib";

const badge = cv({
  base: "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-caption font-bold text-white",
  variants: {
    variant: {
      default: "bg-neutral-600",
      blue: "bg-blue-700",
      red: "bg-red-700",
      green: "bg-green-600",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ label, variant = "default", className }: Badge.Props) {
  return <span className={badge({ variant, className })}>{label}</span>;
}

export namespace Badge {
  export type Variant = "default" | "blue" | "red" | "green";
  export type Props = {
    label: string;
    variant?: Variant;
    className?: string;
  };
}
