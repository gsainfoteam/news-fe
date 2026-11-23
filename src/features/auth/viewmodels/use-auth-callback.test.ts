import { describe, expect, test } from "bun:test";

import { getCallbackPage } from "./use-auth-callback";

describe("getCallbackPage", () => {
  test("reads the language of the page the login started on", () => {
    expect(getCallbackPage("/article/3?x=1")).toEqual({
      returnTo: "/article/3?x=1",
      lng: "ko",
    });
    expect(getCallbackPage("/en/article/3").lng).toBe("en");
  });

  test("falls back to the Korean home when the SDK has no login page", () => {
    expect(getCallbackPage(null)).toEqual({ returnTo: "/", lng: "ko" });
  });
});
