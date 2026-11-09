import { HttpResponse } from "msw";

import { handleGetMe } from "@/@types/api/msw.gen";

import { type Permission, type User } from ".";

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

export function handleMeAnonymous() {
  return handleGetMe(() =>
    HttpResponse.json(
      { message: "Unauthorized", error: "Unauthorized", statusCode: 401 },
      { status: 401 },
    ),
  );
}

export function handleMeError() {
  return handleGetMe(() =>
    HttpResponse.json(
      {
        message: "Internal Server Error",
        error: "Internal Server Error",
        statusCode: 500,
      },
      { status: 500 },
    ),
  );
}
