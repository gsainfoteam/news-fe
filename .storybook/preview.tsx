import { type Preview } from "@storybook/react-vite";

import { withLocale, withTheme } from "./decorators";

import "../src/styles/global.css";

const preview: Preview = {
  globalTypes: {
    // Toggled by the toolbar button in manager.tsx.
    theme: { description: "Color theme" },
    locale: {
      description: "i18n locale",
      toolbar: {
        icon: "globe",
        items: [
          { value: "ko", title: "한국어" },
          { value: "en", title: "English" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
    locale: "ko",
  },
  parameters: {
    // Every component story has Default and Mobile variants; Mobile picks this
    // viewport through story `globals`. Light/dark is the toolbar toggle.
    viewport: {
      options: {
        mobile: {
          name: "Mobile 390",
          styles: { width: "390px", height: "844px" },
          type: "mobile",
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withTheme,
    // i18n locale toolbar.
    withLocale,
  ],
};

export default preview;
