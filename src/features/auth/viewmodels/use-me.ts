import { useQuery } from "@tanstack/react-query";

import { meQuery, type User } from "../models";

export type Session =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | { status: "anonymous" }
  | { status: "authenticated"; user: User };

const ANONYMOUS: Session = { status: "anonymous" };

// Screens see only this Session. Login (NEF-9) changes how `GET /user/me` is
// authenticated inside this hook, so guards and menus built on it stay as is.
export function useMe(): Session {
  const query = useQuery({
    ...meQuery(),
    // A 401 is an answer (not logged in), not a failure worth retrying.
    retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 2,
  });

  if (query.isPending) return { status: "loading" };
  if (query.isError) {
    return isUnauthorized(query.error)
      ? ANONYMOUS
      : { status: "error", retry: () => void query.refetch() };
  }
  return { status: "authenticated", user: query.data };
}

// Network failures and response validation errors are not ErrorDto.
function isUnauthorized(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    error.statusCode === 401
  );
}
