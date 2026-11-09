import { type Preview } from "@storybook/react-vite";
import { mswLoader } from "msw-storybook-addon/csf3";

import { queryClient } from "../src/common/lib/query-client";

import { withLocale, withTheme } from "./decorators";

import "../src/styles/global.css";

const preview: Preview = {
  loaders: [
    // Stories mock the API with `parameters.msw.handlers`, built from each
    // feature's `models/mocks.ts`.
    mswLoader(),
    // Islands share one module-level QueryClient; without this, the next
    // story would show the previous story's cached responses.
    () => {
      queryClient.clear();
    },
  ],
  globalTypes: {
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
