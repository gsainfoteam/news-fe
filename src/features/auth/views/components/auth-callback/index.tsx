import { useMemo } from "react";

import { Loader2Icon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { getPageI18n } from "@/common/lib/i18n";
import { QueryProvider } from "@/common/lib/query-client";

import { AuthProvider } from "../../../viewmodels/auth-provider";
import { useAuthCallback } from "../../../viewmodels/use-auth-callback";
import { LoginFailed } from "../login-failed";

export function AuthCallback() {
  return (
    <QueryProvider>
      <AuthProvider fallback={<Pending />}>
        <AuthCallbackContent />
      </AuthProvider>
    </QueryProvider>
  );
}

function AuthCallbackContent() {
  const callback = useAuthCallback();
  const lng = callback.status === "failed" ? callback.lng : "ko";
  const i18n = useMemo(() => getPageI18n(lng), [lng]);

  if (callback.status === "pending") return <Pending />;
  return (
    <I18nextProvider i18n={i18n}>
      <LoginFailed
        failure={callback.failure}
        onLogin={callback.login}
        backHref={callback.returnTo}
      />
    </I18nextProvider>
  );
}

function Pending() {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex flex-col items-center gap-3">
      <Loader2Icon className="size-6 animate-spin text-subtle-foreground" />
      <span className="text-sm text-muted-foreground">
        {t("auth.callback.pending", "로그인하는 중")}
      </span>
    </div>
  );
}
