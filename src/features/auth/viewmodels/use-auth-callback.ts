import { useEffect, useState } from "react";

import { LANGUAGES, type Language } from "@/common/lib/languages";

import { useAccount } from "../models";
import { getLoginFailure, type LoginFailure } from "./login-failure";

export type AuthCallback =
  | { status: "pending" }
  | {
      status: "failed";
      failure: LoginFailure;
      returnTo: string;
      lng: Language;
      login: () => void;
      retryLogin?: (body: unknown) => Promise<void>;
    };

export function useAuthCallback(): AuthCallback {
  const {
    isLoading,
    isAuthenticated,
    error,
    canRetryLogin,
    login,
    retryLogin,
  } = useAccount();
  const [loginError, setLoginError] = useState<typeof error>(null);
  const failed = !isLoading && !isAuthenticated && error !== null;

  useEffect(() => {
    if (isLoading || failed) return;
    window.location.replace(getCallbackDestination(window.location));
  }, [isLoading, failed]);

  if (!failed) return { status: "pending" };

  const failure = getLoginFailure(loginError ?? error);
  return {
    status: "failed",
    failure,
    returnTo: window.location.href,
    lng: getPathLanguage(window.location.pathname),
    login: () => {
      setLoginError(null);
      login().catch(setLoginError);
    },
    retryLogin: failure === "consent" && canRetryLogin ? retryLogin : undefined,
  };
}

const CALLBACK_PATH = /^(\/en)?\/auth\/callback\/?$/;

export function getCallbackDestination(
  location: Pick<Location, "pathname" | "href">,
) {
  const callback = CALLBACK_PATH.exec(location.pathname);
  return callback ? `${callback[1] ?? ""}/` : location.href;
}

export function getPathLanguage(pathname: string): Language {
  return (
    LANGUAGES.find(
      (lng) =>
        lng !== "ko" &&
        (pathname === `/${lng}` || pathname.startsWith(`/${lng}/`)),
    ) ?? "ko"
  );
}
