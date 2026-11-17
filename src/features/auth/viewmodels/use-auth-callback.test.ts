import { AccountError } from "@infoteam/account-react";
import { describe, expect, test } from "bun:test";


import {
  getCallbackDestination,
  getPathLanguage,
  isTicketExpired,
} from "./use-auth-callback";

describe("getCallbackDestination", () => {
  test("loads the page the SDK put back in the address bar", () => {
    expect(
      getCallbackDestination({
        pathname: "/article/3",
        href: "https://news.test/article/3?x=1",
      }),
    ).toBe("https://news.test/article/3?x=1");
  });

  test("leaves a callback URL with no login in progress for home", () => {
    const at = (pathname: string) =>
      getCallbackDestination({
        pathname,
        href: `https://news.test${pathname}`,
      });
    expect(at("/auth/callback")).toBe("/");
    expect(at("/auth/callback/")).toBe("/");
    expect(at("/en/auth/callback")).toBe("/en/");
  });
});

describe("getPathLanguage", () => {
  test("reads the URL prefix", () => {
    expect(getPathLanguage("/")).toBe("ko");
    expect(getPathLanguage("/article/1")).toBe("ko");
    expect(getPathLanguage("/en")).toBe("en");
    expect(getPathLanguage("/en/article/1")).toBe("en");
    expect(getPathLanguage("/english")).toBe("ko");
  });
});

describe("isTicketExpired", () => {
  test("reads news-be's 401 for a stale ticket", () => {
    expect(isTicketExpired(new AccountError("unknown", { status: 401 }))).toBe(
      true,
    );
  });

  test("leaves other signup failures to the form", () => {
    expect(
      isTicketExpired(new AccountError("server_error", { status: 500 })),
    ).toBe(false);
    expect(isTicketExpired(new AccountError("network_error"))).toBe(false);
    expect(isTicketExpired(new Error("401"))).toBe(false);
  });
});
