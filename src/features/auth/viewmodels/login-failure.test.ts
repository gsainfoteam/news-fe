import { AccountError } from "@infoteam/account-react";
import { describe, expect, test } from "bun:test";

import { getLoginFailure } from "./login-failure";

describe("getLoginFailure", () => {
  test("maps IdP denials", () => {
    expect(getLoginFailure(new AccountError("user_cancelled"))).toBe(
      "cancelled",
    );
    expect(getLoginFailure(new AccountError("verification_required"))).toBe(
      "verification",
    );
  });

  test("tells a first login apart from other rejections", () => {
    const rejected = (reason?: string) =>
      getLoginFailure(new AccountError("session_rejected", { reason }));
    expect(rejected("consent_required")).toBe("consent");
    expect(rejected("x")).toBe("rejected");
    expect(rejected()).toBe("rejected");
  });

  test("groups connection failures", () => {
    expect(getLoginFailure(new AccountError("network_error"))).toBe("network");
    expect(getLoginFailure(new AccountError("server_error"))).toBe("network");
    expect(getLoginFailure(new AccountError("invalid_grant"))).toBe("unknown");
  });
});
