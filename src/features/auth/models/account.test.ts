import { afterEach, beforeEach, expect, test } from "bun:test";

import {
  fetchMe,
  getAccountClient,
  resetAccountClient,
  updateNickname,
} from ".";
import { mockUser } from "./mocks";

class MemoryStorage implements Storage {
  #items = new Map<string, string>();
  get length() {
    return this.#items.size;
  }
  clear() {
    this.#items.clear();
  }
  getItem(key: string) {
    return this.#items.get(key) ?? null;
  }
  key(index: number) {
    return [...this.#items.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.#items.delete(key);
  }
  setItem(key: string, value: string) {
    this.#items.set(key, value);
  }
}

const realFetch = globalThis.fetch;
let tokens: string[];
let calls: string[];
let nicknames: string[];

beforeEach(() => {
  Object.assign(globalThis, {
    window: {
      location: { href: "https://news.test/", origin: "https://news.test" },
      history: { replaceState() {} },
    },
    sessionStorage: new MemoryStorage(),
    localStorage: new MemoryStorage(),
  });
  tokens = ["expired", "fresh"];
  calls = [];
  nicknames = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const { pathname } = new URL(request.url);
    const auth = request.headers.get("authorization");
    calls.push(`${request.method} ${pathname} ${auth ?? "-"}`);

    if (pathname === "/auth/refresh") {
      const token = tokens.shift();
      return token
        ? Response.json({ access_token: token })
        : new Response(null, { status: 401 });
    }
    if (auth !== "Bearer fresh") return new Response(null, { status: 401 });
    if (pathname === "/user/me") return Response.json(mockUser());
    if (pathname === "/user/nickname") {
      const { nickname } = (await request.json()) as { nickname: string };
      nicknames.push(nickname);
      return new Response(null, { status: 200 });
    }
    return new Response(null, { status: 404 });
  }) as typeof fetch;
});

afterEach(() => {
  resetAccountClient();
  globalThis.fetch = realFetch;
});

test("API requests carry the token and refresh once on a 401", async () => {
  const account = getAccountClient();
  await account.ready();
  expect(account.store.getState().status).toBe("authenticated");

  const { data } = await fetchMe({ throwOnError: true });

  expect(data.email).toBe(mockUser().email);
  expect(calls).toEqual([
    "POST /auth/refresh -",
    "GET /user/me Bearer expired",
    "POST /auth/refresh -",
    "GET /user/me Bearer fresh",
  ]);
});

test("a retried request still sends its body", async () => {
  await getAccountClient().ready();

  await updateNickname({ body: { nickname: "새닉네임" }, throwOnError: true });

  expect(calls.slice(1)).toEqual([
    "PATCH /user/nickname Bearer expired",
    "POST /auth/refresh -",
    "PATCH /user/nickname Bearer fresh",
  ]);
  expect(nicknames).toEqual(["새닉네임"]);
});
