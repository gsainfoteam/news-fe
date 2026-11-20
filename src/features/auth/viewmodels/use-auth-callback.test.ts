import { AccountError } from "@infoteam/account-react";
import { describe, expect, test } from "bun:test";

import { getCallbackPage, isTicketExpired } from "./use-auth-callback";

describe("getCallbackPage", () => {
  test("reads the language of the page the login started on", () => {
    expect(getCallbackPage("https://news.test/article/3?x=1")).toEqual({
      returnTo: "https://news.test/article/3?x=1",
      lng: "ko",
    });
    expect(getCallbackPage("https://news.test/en/article/3").lng).toBe("en");
  });

  test("falls back to the Korean home without a remembered page", () => {
    expect(getCallbackPage(null)).toEqual({ returnTo: "/", lng: "ko" });
  });
});

describe("isTicketExpired", () => {
  test("reads news-be's 401 for a stale ticket", () => {
    expect(isTicketExpired(new AccountError("unknown", { status: 401 }))).toBe(
      true,
    );
    expect(isTicketExpired(new AccountError("invalid_ticket"))).toBe(true);
  });

  test("leaves other signup failures to the form", () => {
    expect(
      isTicketExpired(new AccountError("server_error", { status: 500 })),
    ).toBe(false);
    expect(isTicketExpired(new AccountError("network_error"))).toBe(false);
    expect(isTicketExpired(new Error("401"))).toBe(false);
  });
});
