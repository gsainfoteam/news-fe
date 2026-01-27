import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { createTV } from "tailwind-variants";

const tokens = [
  "text-h1",
  "text-h2",
  "text-h3",
  "text-h4",
  "text-body",
  "text-caption",
  "text-nav",
  "text-button",
] as const;

const twMergeConfig = {
  override: {
    classGroups: {
      "font-size": tokens,
      "font-weight": tokens,
    },
  },
};

const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

export const cv = createTV({ twMerge: true, twMergeConfig });
