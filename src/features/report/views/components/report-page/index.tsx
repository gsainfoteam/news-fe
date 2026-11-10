import { useState } from "react";

import { useTranslation } from "react-i18next";

// A client:only island has no server render to inherit i18next from.
import "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import { QueryProvider } from "@/common/lib/query-client";

import { ReportComplete } from "../report-complete";
import { ReportForm } from "../report-form";

export function ReportPage() {
  return (
    <QueryProvider>
      <ReportPageContent />
    </QueryProvider>
  );
}

function ReportPageContent() {
  const { i18n } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  // Remounting the form clears its values and attachments in one go.
  const [round, setRound] = useState(0);

  if (submitted) {
    return (
      <ReportComplete
        autoFocus
        homeHref={localizePath(i18n.language, "/")}
        onReset={() => {
          setSubmitted(false);
          setRound((value) => value + 1);
        }}
      />
    );
  }
  return (
    <ReportForm
      key={round}
      onSubmitted={() => {
        setSubmitted(true);
        window.scrollTo({ top: 0 });
      }}
    />
  );
}
