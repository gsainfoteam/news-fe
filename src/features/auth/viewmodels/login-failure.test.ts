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
    expect(
      getLoginFailure(
        new AccountError("session_rejected", {
          details: { reason: "consent_required" },
        }),
      ),
    ).toBe("consent");
    expect(
      getLoginFailure(
        new AccountError("session_rejected", { reason: "consent_required" }),
      ),
    ).toBe("consent");
    expect(
      getLoginFailure(
        new AccountError("session_rejected", { details: { reason: "x" } }),
      ),
    ).toBe("rejected");
    expect(getLoginFailure(new AccountError("session_rejected"))).toBe(
      "rejected",
    );
  });

  test("groups connection failures", () => {
    expect(getLoginFailure(new AccountError("network_error"))).toBe("network");
    expect(getLoginFailure(new AccountError("server_error"))).toBe("network");
    expect(getLoginFailure(new AccountError("invalid_grant"))).toBe("unknown");
  });
});
