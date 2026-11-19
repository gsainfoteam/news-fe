import { AccountError } from "@infoteam/account-react";
import { describe, expect, mock, test } from "bun:test";

import { resolveSession } from "./use-session";
import { mockUser } from "../models/mocks";

const base = {
  status: "authenticated" as const,
  canRetryLogin: false,
  error: null,
  me: { isPending: false, isError: false, refetch: () => {} },
  login: () => {},
  retryLogin: async () => {},
  logout: () => {},
};

describe("resolveSession", () => {
  test("waits for the SDK, then for the profile", () => {
    expect(resolveSession({ ...base, status: "loading" }).status).toBe(
      "loading",
    );
    expect(
      resolveSession({ ...base, me: { ...base.me, isPending: true } }).status,
    ).toBe("loading");
  });

  test("is authenticated once /user/me answers", () => {
    const user = mockUser();
    const session = resolveSession({ ...base, me: { ...base.me, data: user } });
    expect(session).toMatchObject({ status: "authenticated", user });
  });

  test("reports a profile failure with a retry", () => {
    const refetch = mock(() => {});
    const session = resolveSession({
      ...base,
      me: { ...base.me, isError: true, refetch },
    });
    expect(session.status).toBe("error");
    if (session.status === "error") session.retry();
    expect(refetch).toHaveBeenCalled();
  });

  test("offers retryLogin only for a consent rejection with a ticket", () => {
    const rejected = {
      ...base,
      status: "unauthenticated" as const,
      error: new AccountError("session_rejected", {
        details: { reason: "consent_required" },
      }),
    };
    expect(resolveSession({ ...rejected, canRetryLogin: true })).toMatchObject({
      status: "anonymous",
      failure: "consent",
      retryLogin: base.retryLogin,
    });
    expect(resolveSession(rejected)).toMatchObject({ retryLogin: undefined });
    expect(
      resolveSession({ ...base, status: "unauthenticated" }),
    ).toMatchObject({ status: "anonymous", failure: null });
  });
});
