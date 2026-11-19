import { useEffect, useState } from "react";

import { LANGUAGES, type Language } from "@/common/lib/languages";

import { AccountError, type SignupInput, useAccount } from "../models";
import { getLoginFailure, type LoginFailure } from "./login-failure";

type CallbackPage = {
  returnTo: string;
  lng: Language;
};

export type AuthCallback =
  | { status: "pending" }
  | (CallbackPage & {
      status: "signup";
      /** Resolves only when the login went through; the page then leaves. */
      signup: (input: SignupInput) => Promise<void>;
    })
  | (CallbackPage & {
      status: "failed";
      failure: LoginFailure;
      login: () => void;
    });

export function useAuthCallback(): AuthCallback {
  const {
    isLoading,
    isAuthenticated,
    error,
    canRetryLogin,
    login,
    retryLogin,
  } = useAccount<SignupInput>();
  const [loginError, setLoginError] = useState<typeof error>(null);
  // A failed signup replaces the SDK's `session_rejected` error with that
  // failure, but the ticket is still good: the form stays and shows it.
  const [signingUp, setSigningUp] = useState(false);
  const failed = !isLoading && !isAuthenticated && error !== null;
  const failure = failed ? getLoginFailure(loginError ?? error) : null;
  if (!signingUp && failure === "consent" && canRetryLogin) setSigningUp(true);

  useEffect(() => {
    if (isLoading || failed) return;
    window.location.replace(getCallbackDestination(window.location));
  }, [isLoading, failed]);

  if (!failure) return { status: "pending" };

  const page = {
    returnTo: window.location.href,
    lng: getPathLanguage(window.location.pathname),
  };
  if (signingUp && canRetryLogin) {
    return {
      status: "signup",
      ...page,
      signup: async (input) => {
        try {
          await retryLogin(input);
        } catch (error) {
          if (!isTicketExpired(error)) throw error;
          // The IdP session usually outlives the 5-minute ticket, so this
          // comes straight back with a fresh one.
          await login();
          return new Promise(() => undefined);
        }
      },
    };
  }
  return {
    status: "failed",
    failure,
    ...page,
    login: () => {
      setLoginError(null);
      login().catch(setLoginError);
    },
  };
}

// news-be answers a ticket older than 5 minutes (or one it can't verify)
// with a bare 401, not `invalid_ticket`, so the SDK reports it as `unknown`.
export function isTicketExpired(error: unknown) {
  return (
    AccountError.is(error) && (error.kind === "expired" || error.status === 401)
  );
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
