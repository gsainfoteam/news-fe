import { describe, expect, test } from "bun:test";
import { type TFunction } from "i18next";

import {
  createNicknameFormSchema,
  createSignupFormSchema,
  toSignupInput,
} from "./nickname";

const t = ((_key: string, fallback: string) => fallback) as TFunction;

describe("createSignupFormSchema", () => {
  const schema = createSignupFormSchema(t);
  const valid = { nickname: "새벽세시", terms: true, privacy: true };

  test("needs both agreements", () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, terms: false }).success).toBe(false);
    expect(schema.safeParse({ ...valid, privacy: false }).success).toBe(false);
  });

  test("needs a nickname of at most 20 characters", () => {
    expect(schema.safeParse({ ...valid, nickname: "   " }).success).toBe(false);
    expect(
      schema.safeParse({ ...valid, nickname: "가".repeat(21) }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ ...valid, nickname: "가".repeat(20) }).success,
    ).toBe(true);
  });

  test("sends only the trimmed nickname", () => {
    expect(toSignupInput({ ...valid, nickname: "  새벽세시 " })).toEqual({
      nickname: "새벽세시",
    });
  });
});

describe("createNicknameFormSchema", () => {
  test("uses the signup's nickname rule", () => {
    const schema = createNicknameFormSchema(t);
    expect(schema.safeParse({ nickname: "" }).success).toBe(false);
    expect(schema.safeParse({ nickname: "지니어스" }).success).toBe(true);
  });
});
