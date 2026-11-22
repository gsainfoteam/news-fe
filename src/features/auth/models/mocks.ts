import {
  type AccountClient,
  createAccountClient,
} from "@infoteam/account-react";
import { ACCOUNT_CLIENT_ID, ACCOUNT_ISSUER } from "astro:env/client";
import { delay, HttpResponse } from "msw";

import { client as apiClient } from "@/@types/api/client.gen";
import {
  handleGetMe,
  handleLogout,
  handleRefresh,
  handleUpdateNickname,
} from "@/@types/api/msw.gen";
import { API_URL } from "@/common/lib/api";

import { type Permission, type SignupInput, type User } from ".";

export const MOCK_ACCESS_TOKEN = "mock-access-token";

export function handleSession() {
  return [
    handleRefresh({ body: { access_token: MOCK_ACCESS_TOKEN } }),
    handleLogout(() => new HttpResponse(null, { status: 201 })),
  ];
}

export function handleNoSession() {
  return handleRefresh(() => unauthorized());
}

const pendingSessions = new Set<() => void>();

export function handleSessionPending() {
  return handleRefresh(async () => {
    await new Promise<void>((resolve) => pendingSessions.add(resolve));
    return unauthorized();
  });
}

// Storybook swaps `./account` for `./__mocks__/account`, which re-exports
// this (`sb.mock` in .storybook/preview.tsx). A client restores its session
// only once, so each story gets a new one for the session its handlers give.
export let account: AccountClient<SignupInput>;

export function renewAccount() {
  // A pending refresh holds the SDK's cross-tab refresh lock, so the new
  // client would wait on it forever.
  for (const settle of pendingSessions) settle();
  pendingSessions.clear();

  account = createAccountClient<SignupInput>({
    issuer: ACCOUNT_ISSUER,
    clientId: ACCOUNT_CLIENT_ID,
    api: API_URL,
    app: "mpa",
  });
  apiClient.setConfig({ fetch: account.fetch });
}

export function handleSessionError() {
  return handleRefresh(() => serverError());
}

const ROLE_BY_PERMISSION = {
  NONE: "REPORTING_REPORTER",
  EDITOR: "DEPUTY_EDITOR_IN_CHIEF",
  EDITORSHIP: "EDITOR_IN_CHIEF",
} as const satisfies Record<Permission, User["role"]>;

export function mockUser(overrides: Partial<User> = {}): User {
  const permission = overrides.permission ?? "EDITORSHIP";
  return {
    id: "00000000-0000-4000-8000-000000000001",
    email: "doyun@gm.gist.ac.kr",
    name: "김도윤",
    picture: null,
    nickname: "새벽세시",
    role: ROLE_BY_PERMISSION[permission],
    permission,
    termsAgreedAt: new Date("2025-03-02T09:00:00Z"),
    privacyAgreedAt: new Date("2025-03-02T09:00:00Z"),
    createdAt: new Date("2025-03-02T09:00:00Z"),
    updatedAt: new Date("2025-03-02T09:00:00Z"),
    ...overrides,
  };
}

export function handleMe(user: User) {
  return handleGetMe({ body: user });
}

export function handleMeError() {
  return handleGetMe(() => serverError());
}

export function handleNicknameChange(user: User) {
  let current = user;
  return [
    handleGetMe(() => HttpResponse.json(current)),
    handleUpdateNickname(async ({ request }) => {
      const { nickname } = await request.json();
      await delay(400);
      current = { ...current, nickname };
      return new HttpResponse(null, { status: 200 });
    }),
  ];
}

export function handleNicknameError() {
  return handleUpdateNickname(async () => {
    await delay(400);
    return serverError();
  });
}

function unauthorized() {
  return HttpResponse.json(
    { message: "Unauthorized", error: "Unauthorized", statusCode: 401 },
    { status: 401 },
  );
}

function serverError() {
  return HttpResponse.json(
    {
      message: "Internal Server Error",
      error: "Internal Server Error",
      statusCode: 500,
    },
    { status: 500 },
  );
}
