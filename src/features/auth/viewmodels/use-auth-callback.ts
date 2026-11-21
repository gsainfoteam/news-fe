import { useEffect, useState } from "react";

import {
  getPathLanguage,
  type Language,
  localizePath,
} from "@/common/lib/languages";

import { AccountError, type SignupInput, useAccount } from "../models";
import { loginFrom } from "./login";
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

// The SDK leaves for the login's page itself after a callback goes through
// (`app: 'mpa'`), so this hook only sees a failed callback or none at all.
export function useAuthCallback(): AuthCallback {
  const {
    isLoading,
    isAuthenticated,
    error,
    canRetryLogin,
    login,
    retryLogin,
    loginReturnTo,
  } = useAccount<SignupInput>();
  const page = getCallbackPage(loginReturnTo);
  // A failed signup replaces the SDK's `session_rejected` error with that
  // failure, but the ticket is still good: the form stays and shows it.
  const [signingUp, setSigningUp] = useState(false);
  const failed = !isLoading && !isAuthenticated && error !== null;
  const failure = failed ? getLoginFailure(error) : null;
  if (!signingUp && failure === "consent" && canRetryLogin) setSigningUp(true);

  useEffect(() => {
    if (isLoading || failed) return;
    window.location.replace(localizePath(page.lng, "/"));
  }, [isLoading, failed, page.lng]);

  if (!failure) return { status: "pending" };

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
          await loginFrom(login, page.returnTo);
        }
      },
    };
  }
  return {
    status: "failed",
    failure,
    ...page,
    login: () => void loginFrom(login, page.returnTo),
  };
}

export function getCallbackPage(returnTo: string | null): CallbackPage {
  if (!returnTo) return { returnTo: "/", lng: "ko" };
  const { pathname } = new URL(returnTo, "https://localhost");
  return { returnTo, lng: getPathLanguage(pathname) };
}

// news-be answers a ticket older than 5 minutes (or one it can't verify)
// with a bare 401, not `invalid_ticket`, so the SDK reports it as `unknown`.
export function isTicketExpired(error: unknown) {
  return (
    AccountError.is(error) && (error.kind === "expired" || error.status === 401)
  );
}
