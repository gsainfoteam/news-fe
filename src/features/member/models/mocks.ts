import { HttpResponse } from "msw";

import {
  handleDeleteMember,
  handleGetMembers,
  handleRegisterMembers,
  handleUpdateMember,
} from "@/@types/api/msw.gen";

import { type Member, type MemberRole } from ".";

const PERMISSION: Record<MemberRole, Member["permission"]> = {
  EDITOR_IN_CHIEF: "EDITORSHIP",
  DEPUTY_EDITOR_IN_CHIEF: "EDITOR",
  REPORTING_SENIOR_REPORTER: "EDITOR",
  SENIOR_DESIGNER: "EDITOR",
  DIGITAL_SENIOR_REPORTER: "EDITOR",
  REPORTING_REPORTER: "NONE",
  DESIGNER: "NONE",
  DIGITAL_REPORTER: "NONE",
  CUB_REPORTER: "NONE",
  ALUMNI: "NONE",
};

let nextId = 1;

export function mockMember(overrides: Partial<Member> = {}): Member {
  const role = overrides.role ?? "CUB_REPORTER";
  const createdAt = overrides.createdAt ?? new Date("2025-03-02T09:00:00Z");
  return {
    id: `00000000-0000-4000-9000-${String(nextId++).padStart(12, "0")}`,
    email: "member@gm.gist.ac.kr",
    name: "멤버",
    picture: null,
    role,
    permission: PERMISSION[role],
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

const date = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m - 1, d, 0));

// The first one matches `mockUser()` from the auth mocks (same email), so it
// is the signed-in editor-in-chief.
export const MOCK_MEMBERS: Member[] = [
  mockMember({
    name: "김도윤",
    email: "doyun@gm.gist.ac.kr",
    role: "EDITOR_IN_CHIEF",
    createdAt: date(2025, 3, 2),
  }),
  mockMember({
    name: "이서연",
    email: "seoyeon@gm.gist.ac.kr",
    role: "DEPUTY_EDITOR_IN_CHIEF",
    createdAt: date(2025, 3, 2),
  }),
  mockMember({
    name: "박지호",
    email: "jiho@gm.gist.ac.kr",
    role: "REPORTING_SENIOR_REPORTER",
    createdAt: date(2025, 3, 10),
  }),
  mockMember({
    name: "최하은",
    email: "haeun@gm.gist.ac.kr",
    role: "DESIGNER",
    createdAt: date(2025, 9, 1),
  }),
  mockMember({
    name: "정민준",
    email: "minjun@gm.gist.ac.kr",
    role: "DIGITAL_SENIOR_REPORTER",
    createdAt: date(2025, 3, 10),
  }),
  mockMember({
    name: "한지우",
    email: "jiwoo@gm.gist.ac.kr",
    role: "REPORTING_REPORTER",
    createdAt: date(2025, 9, 1),
  }),
  mockMember({
    name: "오세린",
    email: "serin@gm.gist.ac.kr",
    role: "CUB_REPORTER",
    createdAt: date(2026, 9, 5),
  }),
  mockMember({
    name: "윤태오",
    email: "taeo@gm.gist.ac.kr",
    role: "ALUMNI",
    createdAt: date(2024, 3, 4),
  }),
];

const error = (statusCode: number, message: string) =>
  HttpResponse.json(
    { message, error: message, statusCode },
    { status: statusCode },
  );

// Follows news-be's rules so a story can run the whole flow: the caller
// (`callerEmail`) cannot change or delete themselves, and handing over
// EDITOR_IN_CHIEF demotes the caller to CUB_REPORTER.
export function handleMembers(
  initial: Member[],
  { callerEmail = initial[0]?.email }: { callerEmail?: string } = {},
) {
  let members = [...initial];
  const isCaller = (id: string) =>
    members.find((m) => m.id === id)?.email === callerEmail;
  const setRole = (member: Member, role: MemberRole): Member => ({
    ...member,
    role,
    permission: PERMISSION[role],
    updatedAt: new Date(),
  });

  return [
    handleGetMembers(() => HttpResponse.json(members)),
    handleRegisterMembers(async ({ request }) => {
      const body = await request.json();
      if (body.some((b) => members.some((m) => m.email === b.email))) {
        return error(500, "Internal Server Error");
      }
      members = [
        ...members,
        ...body.map((b) =>
          mockMember({ ...b, createdAt: new Date(), updatedAt: new Date() }),
        ),
      ];
      return new HttpResponse(null, { status: 201 });
    }),
    handleUpdateMember(async ({ params, request }) => {
      const id = String(params.id);
      if (isCaller(id)) return error(403, "Forbidden");
      const { role, ...rest } = await request.json();
      members = members.map((m) => {
        if (m.id === id) return { ...setRole(m, role ?? m.role), ...rest };
        if (role === "EDITOR_IN_CHIEF" && m.email === callerEmail) {
          return setRole(m, "CUB_REPORTER");
        }
        return m;
      });
      return new HttpResponse(null, { status: 200 });
    }),
    handleDeleteMember(({ params }) => {
      const id = String(params.id);
      if (isCaller(id)) return error(403, "Forbidden");
      members = members.filter((m) => m.id !== id);
      return new HttpResponse(null, { status: 200 });
    }),
  ];
}

export function handleMembersError() {
  return handleGetMembers(() => error(500, "Internal Server Error"));
}
