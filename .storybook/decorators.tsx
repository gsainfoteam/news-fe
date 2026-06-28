import React from "react";
import { type Decorator } from "@storybook/react-vite";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import { i18n } from "../src/common/lib/i18n";

import "../src/common/lib/dayjs";

/** Syncs the active i18next language (and dayjs locale) with the toolbar. */
export const withLocale: Decorator = (Story, context) => {
  const locale = (context.globals.locale as string) ?? "ko";

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <Story />
    </I18nextProvider>
  );
};
