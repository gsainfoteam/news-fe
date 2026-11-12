import { describe, expect, test } from "bun:test";
import { type TFunction } from "i18next";

import {
  createMemberFormSchema,
  type MemberFormValues,
  toMemberInputs,
} from "./member-form";

// Returns the default text, like i18next before the JSON loads.
const t = ((_key: string, fallback: string) => fallback) as TFunction;

const row = (email: string, name = "박서윤") =>
  ({ email, name, role: "CUB_REPORTER" }) as const;

const errorsOf = (
  values: MemberFormValues,
  existing: string[] = [],
): Record<string, string> => {
  const result = createMemberFormSchema(t, existing).safeParse(values);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((i) => [i.path.join("."), i.message]),
  );
};

describe("createMemberFormSchema", () => {
  test("accepts several new members", () => {
    expect(
      errorsOf({ members: [row("a@gm.gist.ac.kr"), row("b@gm.gist.ac.kr")] }),
    ).toEqual({});
  });

  test("requires every field of every row", () => {
    expect(
      errorsOf({ members: [row("a@gm.gist.ac.kr"), row("", " ")] }),
    ).toEqual({
      "members.1.email": "이메일을 입력해 주세요",
      "members.1.name": "이름을 입력해 주세요",
    });
  });

  test("flags an email already on the list", () => {
    expect(
      errorsOf({ members: [row(" Doyun@gm.gist.ac.kr ")] }, [
        "doyun@gm.gist.ac.kr",
      ]),
    ).toEqual({ "members.0.email": "이미 등록된 멤버입니다" });
  });

  test("flags the later of two equal emails", () => {
    expect(
      errorsOf({ members: [row("a@gm.gist.ac.kr"), row("A@gm.gist.ac.kr")] }),
    ).toEqual({ "members.1.email": "위에서 입력한 이메일입니다" });
  });

  test("rejects EDITOR_IN_CHIEF, which is only handed over", () => {
    const result = createMemberFormSchema(t, []).safeParse({
      members: [{ ...row("a@gm.gist.ac.kr"), role: "EDITOR_IN_CHIEF" }],
    });
    expect(result.success).toBe(false);
  });
});

test("toMemberInputs trims what the backend stores", () => {
  expect(
    toMemberInputs({ members: [row("  a@gm.gist.ac.kr ", " 박서윤 ")] }),
  ).toEqual([
    { email: "a@gm.gist.ac.kr", name: "박서윤", role: "CUB_REPORTER" },
  ]);
});
