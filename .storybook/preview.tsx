import { type Preview } from "@storybook/react-vite";
import { isCommonAssetRequest } from "msw";
import { setupWorker } from "msw/browser";
import { mswLoader } from "msw-storybook-addon/csf3";

import { queryClient } from "../src/common/lib/query-client";

import { withLocale, withTheme } from "./decorators";

import "../src/styles/global.css";

// The addon's default setup throws when the browser refuses service workers
// (embedded browsers, some privacy modes), and that error replaces every
// story. Without the worker, stories still render; only API calls go unmocked.
async function startWorker() {
  const worker = setupWorker();
  try {
    await worker.start({
      quiet: true,
      onUnhandledRequest(request, print) {
        if (isCommonAssetRequest(request) || !request.url.includes("/api/"))
          return;
        print.warning();
      },
    });
  } catch (error) {
    console.warn("[msw] API mocks are off in this browser.", error);
  }
  return worker;
}

const preview: Preview = {
  loaders: [
    // Stories mock the API with `parameters.msw.handlers`, built from each
    // feature's `models/mocks.ts`.
    mswLoader(startWorker),
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
