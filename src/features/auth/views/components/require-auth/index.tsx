import { type ReactNode } from "react";

import { Loader2Icon, LockKeyholeIcon, LogInIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/common/components/ui/button";
import { ErrorState } from "@/common/components/ui/error-state";
import { cn } from "@/common/lib/cn";
import { localizePath } from "@/common/lib/languages";
import { QueryProvider } from "@/common/lib/query-client";

import { type User } from "../../../models";
import { AuthProvider } from "../../../viewmodels/auth-provider";
import { useSession } from "../../../viewmodels/use-session";
import { AuthMessage } from "../auth-message";
import { LoginFailed } from "../login-failed";

export function RequireAuth(props: RequireAuth.Props) {
  return (
    <QueryProvider>
      <AuthProvider>
        <RequireAuthContent {...props} />
      </AuthProvider>
    </QueryProvider>
  );
}

export namespace RequireAuth {
  export type Signed = { user: User; logout: () => void };

  export type Props = {
    children: ReactNode | ((session: Signed) => ReactNode);
    frame?: (screen: ReactNode) => ReactNode;
    loginScreen?: (login: () => void) => ReactNode;
  };
}

const defaultFrame = (screen: ReactNode) => (
  <div className="flex justify-center px-4 pt-[120px] pb-[140px] mobile:pt-20 mobile:pb-24">
    {screen}
  </div>
);

function RequireAuthContent({
  children,
  frame = defaultFrame,
  loginScreen,
}: RequireAuth.Props) {
  const { t, i18n } = useTranslation();
  const session = useSession();

  switch (session.status) {
    case "loading":
      return frame(
        <div role="status" className="flex flex-col items-center gap-3">
          <Loader2Icon className="size-6 animate-spin text-subtle-foreground" />
          <span className="sr-only">{t("auth.loading", "불러오는 중")}</span>
        </div>,
      );
    case "error":
      return frame(
        <ErrorState
          title={t("auth.error.title", "계정 정보를 불러오지 못했습니다")}
          description={t("error.description", "잠시 후 다시 시도해 주세요.")}
          retryLabel={t("error.retry", "다시 시도")}
          onRetry={session.retry}
          className="w-full max-w-[420px] self-start"
        />,
      );
    case "anonymous":
      return frame(
        session.failure ? (
          <LoginFailed
            failure={session.failure}
            onLogin={session.login}
            backHref={localizePath(i18n.language, "/")}
            backLabel={t("auth.toHome", "홈으로 가기")}
          />
        ) : loginScreen ? (
          loginScreen(session.login)
        ) : (
          <LoginRequired onLogin={session.login} />
        ),
      );
    case "authenticated":
      return typeof children === "function"
        ? children({ user: session.user, logout: session.logout })
        : children;
  }
}

function LoginRequired({ onLogin }: { onLogin: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <AuthMessage
      icon={<LockKeyholeIcon />}
      title={t("auth.required.title", "로그인이 필요합니다")}
      description={t(
        "auth.required.description",
        "인포팀 계정으로 로그인하면 이 페이지를 볼 수 있습니다.",
      )}
    >
      <Button onClick={onLogin}>
        <LogInIcon />
        {t("auth.loginWithAccount", "인포팀 계정으로 로그인")}
      </Button>
      <a
        href={localizePath(i18n.language, "/")}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        {t("auth.toHome", "홈으로 가기")}
      </a>
    </AuthMessage>
  );
}
