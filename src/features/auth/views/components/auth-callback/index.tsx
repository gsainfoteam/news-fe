import { useMemo, useState } from "react";

import { Loader2Icon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { getPageI18n } from "@/common/lib/i18n";
import { QueryProvider } from "@/common/lib/query-client";

import { AuthProvider } from "../../../viewmodels/auth-provider";
import {
  type AuthCallback as Callback,
  useAuthCallback,
} from "../../../viewmodels/use-auth-callback";
import { LoginFailed } from "../login-failed";
import { SignupDialog } from "../signup-dialog";

// The `/auth/callback` island. It has no story: it reloads the page it runs
// in. Its screens are the spinner below, LoginFailed and SignupDialog.
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
  const lng = callback.status === "pending" ? "ko" : callback.lng;
  const i18n = useMemo(() => getPageI18n(lng), [lng]);

  if (callback.status === "pending") return <Pending />;
  return (
    <I18nextProvider i18n={i18n}>
      {callback.status === "signup" ? (
        <Signup callback={callback} />
      ) : (
        <LoginFailed
          failure={callback.failure}
          onLogin={callback.login}
          backHref={callback.returnTo}
        />
      )}
    </I18nextProvider>
  );
}

// The ticket lives in memory, so the signup can't move to another page.
// Closed, the dialog leaves the consent notice, which can reopen it.
function Signup({
  callback,
}: {
  callback: Extract<Callback, { status: "signup" }>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <LoginFailed
        failure="consent"
        onLogin={() => setOpen(true)}
        onSignup={() => setOpen(true)}
        backHref={callback.returnTo}
      />
      <SignupDialog
        open={open}
        onOpenChange={setOpen}
        onSignup={callback.signup}
      />
    </>
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
