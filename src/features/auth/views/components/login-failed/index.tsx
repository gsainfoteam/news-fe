import { type ReactNode } from "react";

import {
  CircleAlertIcon,
  LogInIcon,
  ShieldAlertIcon,
  UserRoundPlusIcon,
  UserRoundXIcon,
  WifiOffIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/common/components/ui/button";
import { cn } from "@/common/lib/cn";

import { type LoginFailure } from "../../../viewmodels/login-failure";
import { AuthMessage } from "../auth-message";

export function LoginFailed({
  failure,
  onLogin,
  onSignup,
  backHref,
  backLabel,
  className,
}: LoginFailed.Props) {
  const { t } = useTranslation();
  const { icon, title, description } = useFailureCopy(failure, !!onSignup);

  return (
    <AuthMessage
      icon={icon}
      title={title}
      description={description}
      className={className}
    >
      {onSignup ? (
        <Button onClick={onSignup}>
          <UserRoundPlusIcon />
          {t("auth.failed.signup", "가입하기")}
        </Button>
      ) : (
        <Button onClick={onLogin}>
          <LogInIcon />
          {t("auth.failed.retry", "다시 로그인")}
        </Button>
      )}
      <a href={backHref} className={cn(buttonVariants({ variant: "outline" }))}>
        {backLabel ?? t("auth.failed.back", "돌아가기")}
      </a>
    </AuthMessage>
  );
}

export namespace LoginFailed {
  export type Props = {
    failure: LoginFailure;
    backHref: string;
    backLabel?: string;
    className?: string;
  } & (
    | { onLogin: () => void; onSignup?: never }
    // Reopens the signup form; only the callback page still holds a ticket.
    | { onSignup: () => void; onLogin?: never }
  );
}

function useFailureCopy(
  failure: LoginFailure,
  canSignup: boolean,
): {
  icon: ReactNode;
  title: string;
  description: string;
} {
  const { t } = useTranslation();
  switch (failure) {
    case "cancelled":
      return {
        icon: <UserRoundXIcon />,
        title: t("auth.failed.cancelled.title", "로그인을 취소했습니다"),
        description: t(
          "auth.failed.cancelled.description",
          "인포팀 계정 화면에서 로그인을 취소했습니다. 다시 로그인하려면 아래 버튼을 눌러 주세요.",
        ),
      };
    case "verification":
      return {
        icon: <ShieldAlertIcon />,
        title: t("auth.failed.verification.title", "계정 인증이 필요합니다"),
        description: t(
          "auth.failed.verification.description",
          "지스트신문에 필요한 정보가 인포팀 계정에서 아직 인증되지 않았습니다. 인증을 마친 뒤 다시 로그인해 주세요.",
        ),
      };
    case "consent":
      return {
        icon: <UserRoundPlusIcon />,
        title: t("auth.failed.consent.title", "가입이 필요한 계정입니다"),
        description: canSignup
          ? t(
              "auth.failed.consent.description",
              "처음 로그인하는 계정은 약관에 동의하고 가입해야 합니다. 가입하지 않으면 로그인되지 않습니다.",
            )
          : t(
              "auth.failed.consent.relogin",
              "처음 로그인하는 계정은 약관에 동의하고 가입해야 합니다. 다시 로그인하면 가입 화면이 열립니다.",
            ),
      };
    case "rejected":
      return {
        icon: <UserRoundXIcon />,
        title: t("auth.failed.rejected.title", "로그인할 수 없는 계정입니다"),
        description: t(
          "auth.failed.rejected.description",
          "지스트신문이 이 계정의 로그인을 받지 않았습니다. 문제가 계속되면 지스트신문에 문의해 주세요.",
        ),
      };
    case "network":
      return {
        icon: <WifiOffIcon />,
        title: t("auth.failed.network.title", "서버에 연결하지 못했습니다"),
        description: t(
          "auth.failed.network.description",
          "인터넷 연결을 확인하고 다시 시도해 주세요.",
        ),
      };
    case "unknown":
      return {
        icon: <CircleAlertIcon />,
        title: t("auth.failed.unknown.title", "로그인하지 못했습니다"),
        description: t(
          "auth.failed.unknown.description",
          "잠시 후 다시 시도해 주세요.",
        ),
      };
  }
}
