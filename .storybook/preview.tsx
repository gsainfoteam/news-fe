import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { type Preview } from "@storybook/react-vite";

import { withLocale } from "./decorators";

import "../src/styles/global.css";

const preview: Preview = {
  globalTypes: {
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
    locale: "ko",
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    // Light / dark via `data-theme` (Tailwind `dark:` variant responds to it).
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
    // i18n locale toolbar.
    withLocale,
    // Themed canvas so the theme toggle is visible even on components that
    // don't yet define their own `dark:` styles.
    (Story) => (
      <div className="bg-neutral-100 p-6 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <Story />
      </div>
    ),
  ],
};

export default preview;
