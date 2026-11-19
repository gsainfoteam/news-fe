import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type AccountError,
  type AccountState,
  meQuery,
  type SignupInput,
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
      retryLogin?: (body: SignupInput) => Promise<void>;
    }
  | { status: "error"; retry: () => void; logout: () => void }
  | { status: "authenticated"; user: User; logout: () => void };

export function useSession(): Session {
  const account = useAccount<SignupInput>();
  const queryClient = useQueryClient();
  const me = useQuery({
    ...meQuery(),
    enabled: account.isAuthenticated,
    retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 2,
  });

  return resolveSession({
    status: account.status,
    error: account.error,
    canRetryLogin: account.canRetryLogin,
    me,
    login: () => void account.login().catch(() => undefined),
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
  error: AccountError | null;
  me: {
    isPending: boolean;
    isError: boolean;
    data?: User;
    refetch: () => unknown;
  };
  login: () => void;
  retryLogin: (body: SignupInput) => Promise<void>;
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
