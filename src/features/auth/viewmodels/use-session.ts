import { useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type AccountError,
  type AccountState,
  meQuery,
  useAccount,
  type User,
} from "../models";
import { getLoginFailure, type LoginFailure } from "./login-failure";

export type Session =
  | { status: "loading" }
  | {
      status: "anonymous";
      failure: LoginFailure | null;
      login: () => void;
      retryLogin?: (body: unknown) => Promise<void>;
    }
  | { status: "error"; retry: () => void; logout: () => void }
  | { status: "authenticated"; user: User; logout: () => void };

export function useSession(): Session {
  const account = useAccount();
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<AccountError | null>(null);
  const me = useQuery({
    ...meQuery(),
    enabled: account.isAuthenticated,
    retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 2,
  });

  return resolveSession({
    status: account.status,
    error: loginError ?? account.error,
    canRetryLogin: account.canRetryLogin,
    me,
    login: () => {
      setLoginError(null);
      account.login().catch(setLoginError);
    },
    retryLogin: account.retryLogin,
    logout: () => {
      void account
        .logout()
        .then(() =>
          queryClient.removeQueries({ queryKey: meQuery().queryKey }),
        );
    },
  });
}

type SessionInput = Pick<AccountState, "status" | "canRetryLogin"> & {
  error: Pick<AccountError, "code" | "details"> | null;
  me: {
    isPending: boolean;
    isError: boolean;
    data?: User;
    refetch: () => unknown;
  };
  login: () => void;
  retryLogin: (body: unknown) => Promise<void>;
  logout: () => void;
};

export function resolveSession(input: SessionInput): Session {
  const { status, error, me, logout } = input;

  if (status === "loading") return { status: "loading" };
  if (status === "unauthenticated") {
    const failure = error ? getLoginFailure(error) : null;
    return {
      status: "anonymous",
      failure,
      login: input.login,
      retryLogin:
        failure === "consent" && input.canRetryLogin
          ? input.retryLogin
          : undefined,
    };
  }

  if (me.isError) {
    return { status: "error", retry: () => void me.refetch(), logout };
  }
  if (me.isPending || !me.data) return { status: "loading" };
  return { status: "authenticated", user: me.data, logout };
}

function isUnauthorized(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    error.statusCode === 401
  );
}
