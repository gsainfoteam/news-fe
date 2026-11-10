import { type TFunction } from "i18next";
import { z } from "zod";

import {
  type MemberInput,
  type RegistrableRole,
  zMemberInput,
} from "../models";

export type MemberRowValues = {
  email: string;
  name: string;
  role: RegistrableRole;
};

export type MemberFormValues = { members: MemberRowValues[] };

export const MAX_MEMBER_ROWS = 20;
export const MEMBER_NAME_MAX = 50;

export const emptyMemberRow = (): MemberRowValues => ({
  email: "",
  name: "",
  role: "CUB_REPORTER",
});

export const MEMBER_FORM_DEFAULTS: MemberFormValues = {
  members: [emptyMemberRow()],
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// news-be inserts the whole batch at once and has no duplicate check of its
// own: a taken email fails every row with a 500. So duplicates are caught
// here, against the list and within the form. `existingEmails` is the loaded
// list; a member added elsewhere in the meantime still gets the 500.
export function createMemberFormSchema(
  t: TFunction,
  existingEmails: readonly string[],
) {
  const existing = new Set(existingEmails.map(normalizeEmail));
  const row = zMemberInput.extend({
    email: z
      .string()
      .trim()
      .min(1, t("member.error.emailRequired", "이메일을 입력해 주세요"))
      .pipe(
        z.email(t("member.error.emailInvalid", "이메일 형식을 확인해 주세요")),
      ),
    name: z
      .string()
      .trim()
      .min(1, t("member.error.nameRequired", "이름을 입력해 주세요"))
      .max(
        MEMBER_NAME_MAX,
        t("member.error.nameTooLong", "이름은 50자 이하로 입력해 주세요"),
      ),
  });

  return z.object({
    members: z
      .array(row)
      .min(1)
      .max(MAX_MEMBER_ROWS)
      .superRefine((rows, ctx) => {
        const seen = new Set<string>();
        rows.forEach(({ email }, index) => {
          const key = normalizeEmail(email);
          if (!key) return;
          const message = existing.has(key)
            ? t("member.error.emailRegistered", "이미 등록된 멤버입니다")
            : seen.has(key)
              ? t("member.error.emailDuplicated", "위에서 입력한 이메일입니다")
              : undefined;
          seen.add(key);
          if (message) {
            ctx.addIssue({ code: "custom", message, path: [index, "email"] });
          }
        });
      }),
  });
}

export function toMemberInputs(values: MemberFormValues): MemberInput[] {
  return values.members.map(({ email, name, role }) => ({
    email: email.trim(),
    name: name.trim(),
    role,
  }));
}
