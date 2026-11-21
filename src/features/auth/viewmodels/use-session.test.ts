import { AccountError } from "@infoteam/account-react";
import { describe, expect, mock, test } from "bun:test";

import { resolveSession } from "./use-session";
import { mockUser } from "../models/mocks";

const base = {
  status: "authenticated" as const,
  error: null,
  me: { isPending: false, isError: false, refetch: () => {} },
  login: () => {},
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

  test("is anonymous with the failure of the last login, if any", () => {
    const anonymous = { ...base, status: "unauthenticated" as const };
    expect(resolveSession(anonymous)).toMatchObject({
      status: "anonymous",
      failure: null,
    });
    expect(
      resolveSession({
        ...anonymous,
        error: new AccountError("network_error"),
      }),
    ).toMatchObject({ status: "anonymous", failure: "network" });
  });
});
