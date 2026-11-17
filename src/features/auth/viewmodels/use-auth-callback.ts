import { useEffect, useState } from "react";

import { LANGUAGES, type Language } from "@/common/lib/languages";

import { useAccount } from "../models";
import { getLoginFailure, type LoginFailure } from "./login-failure";

export type AuthCallback =
  | { status: "pending" }
  | {
      status: "failed";
      failure: LoginFailure;
      /** Where the login started; the failure screen links back to it. */
      returnTo: string;
      /** The language of that page; the callback URL itself is Korean. */
      lng: Language;
      login: () => void;
      /** See `Session`: set after a `consent` failure for NEF-13's signup. */
      retryLogin?: (body: unknown) => Promise<void>;
    };

// Runs on /auth/callback. The SDK finishes the login and has already put the
// page the login started from in the address bar, but this document is still
// the callback page, so a success has to load that page for real.
export function useAuthCallback(): AuthCallback {
  const { status, error, canRetryLogin, login, retryLogin } = useAccount();
  const [loginError, setLoginError] = useState<typeof error>(null);
  const failed = status === "unauthenticated" && error !== null;

  useEffect(() => {
    if (status === "loading" || failed) return;
    // The access token lives in memory and is lost here; the next page
    // restores it from the refresh cookie.
    window.location.replace(getCallbackDestination(window.location));
  }, [status, failed]);

  if (!failed) return { status: "pending" };

  const failure = getLoginFailure(loginError ?? error);
  return {
    status: "failed",
    failure,
    returnTo: window.location.href,
    lng: getPathLanguage(window.location.pathname),
    // `login()` rejects only when the IdP can't be reached; the failure
    // screen then shows that instead of a button that seems to do nothing.
    login: () => {
      setLoginError(null);
      login().catch(setLoginError);
    },
    retryLogin: failure === "consent" && canRetryLogin ? retryLogin : undefined,
  };
}

const CALLBACK_PATH = /^(\/en)?\/auth\/callback\/?$/;

// Opened without a login in progress (a bookmark, a reload), the SDK leaves
// the callback URL in place; reloading it would loop.
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
