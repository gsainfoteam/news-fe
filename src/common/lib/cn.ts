import { createCn } from "cn/config";
import { createTV } from "tailwind-variants";

// Without this, `text-h1` reads as a text color: it would drop `text-primary`
// and keep `text-sm`. Registering it as a font-size fixes both.
const twMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["h1", "h2", "h3", "h4", "body", "caption", "nav", "button"],
        },
      ],
    },
  },
};

export const cn = createCn(twMergeConfig);

export const cv = createTV({ twMerge: true, twMergeConfig });
