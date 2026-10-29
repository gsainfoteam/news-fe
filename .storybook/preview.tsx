import { withThemeByClassName } from "@storybook/addon-themes";
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
    // Light / dark via the `.dark` class on <html>; body colors come from the
    // shadcn theme variables in global.css.
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    // i18n locale toolbar.
    withLocale,
  ],
};

export default preview;
