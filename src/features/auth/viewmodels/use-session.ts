import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type AccountError,
  type AccountState,
  meQuery,
  useAccount,
  type User,
} from "../models";
import { loginFrom } from "./login";
import { getLoginFailure, type LoginFailure } from "./login-failure";

export type Session =
  | { status: "loading" }
  | { status: "anonymous"; failure: LoginFailure | null; login: () => void }
  | { status: "error"; retry: () => void; logout: () => void }
  | { status: "authenticated"; user: User; logout: () => void };

export function useSession(): Session {
  const account = useAccount();
  const queryClient = useQueryClient();
  const me = useQuery({
    ...meQuery(),
    enabled: account.isAuthenticated,
    retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 2,
  });

  return resolveSession({
    status: account.status,
    error: account.error,
    me,
    login: () => void loginFrom(account.login),
    logout: () => {
      void account
        .logout()
        .then(() =>
          queryClient.removeQueries({ queryKey: meQuery().queryKey }),
        );
    },
  });
}

type SessionInput = Pick<AccountState, "status"> & {
  error: AccountError | null;
  me: {
    isPending: boolean;
    isError: boolean;
    data?: User;
    refetch: () => unknown;
  };
  login: () => void;
  logout: () => void;
};

export function resolveSession({
  status,
  error,
  me,
  login,
  logout,
}: SessionInput): Session {
  if (status === "loading") return { status: "loading" };
  if (status === "unauthenticated") {
    return {
      status: "anonymous",
      failure: error ? getLoginFailure(error) : null,
      login,
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
