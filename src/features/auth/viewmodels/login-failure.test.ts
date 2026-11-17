import { describe, expect, test } from "bun:test";

import { getLoginFailure } from "./login-failure";

describe("getLoginFailure", () => {
  test("maps IdP denials", () => {
    expect(
      getLoginFailure({ code: "user_cancelled", details: undefined }),
    ).toBe("cancelled");
    expect(
      getLoginFailure({ code: "verification_required", details: undefined }),
    ).toBe("verification");
  });

  test("tells a first login apart from other rejections", () => {
    expect(
      getLoginFailure({
        code: "session_rejected",
        details: { reason: "consent_required" },
      }),
    ).toBe("consent");
    expect(
      getLoginFailure({ code: "session_rejected", details: { reason: "x" } }),
    ).toBe("rejected");
    expect(
      getLoginFailure({ code: "session_rejected", details: undefined }),
    ).toBe("rejected");
  });

  test("groups connection failures", () => {
    expect(getLoginFailure({ code: "network_error", details: undefined })).toBe(
      "network",
    );
    expect(getLoginFailure({ code: "server_error", details: undefined })).toBe(
      "unknown",
    );
  });
});
