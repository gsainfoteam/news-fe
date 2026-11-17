import { type TFunction } from "i18next";
import { z } from "zod";

import { zNicknameInput, zSignupInput, type SignupInput } from "../models";

// news-be stores any string; this cap is ours, from the NEB-22 proposal, so
// a nickname fits the header menu and comment bylines.
export const NICKNAME_MAX_LENGTH = 20;

function nickname(t: TFunction) {
  return z
    .string()
    .trim()
    .min(1, t("auth.nickname.required", "닉네임을 입력해 주세요"))
    .max(
      NICKNAME_MAX_LENGTH,
      t("auth.nickname.tooLong", "닉네임은 20자 이하로 입력해 주세요"),
    );
}

export type NicknameFormValues = { nickname: string };

// Built from the generated DTO schemas so a field the backend adds or drops
// breaks here. Messages are set per field because the page language decides
// them (zod's locale is global).
export function createNicknameFormSchema(t: TFunction) {
  return zNicknameInput.extend({ nickname: nickname(t) });
}

export type SignupFormValues = {
  nickname: string;
  terms: boolean;
  privacy: boolean;
};

export const SIGNUP_FORM_DEFAULTS: SignupFormValues = {
  nickname: "",
  terms: false,
  privacy: false,
};

export function createSignupFormSchema(t: TFunction) {
  return zSignupInput.extend({
    nickname: nickname(t),
    terms: z.literal(
      true,
      t("auth.signup.termsRequired", "이용약관에 동의해 주세요"),
    ),
    privacy: z.literal(
      true,
      t("auth.signup.privacyRequired", "개인정보 수집과 이용에 동의해 주세요"),
    ),
  });
}

// news-be takes the retried login itself as the agreement: the checkboxes
// only gate the button and are not sent.
export function toSignupInput(values: SignupFormValues): SignupInput {
  return { nickname: values.nickname.trim() };
}
