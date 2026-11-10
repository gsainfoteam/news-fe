import { type TFunction } from "i18next";

import { type MemberRole } from "../models";

// Literal keys so gen:i18n can extract them.
export function getRoleLabels(t: TFunction): Record<MemberRole, string> {
  return {
    EDITOR_IN_CHIEF: t("role.EDITOR_IN_CHIEF", "편집장"),
    DEPUTY_EDITOR_IN_CHIEF: t("role.DEPUTY_EDITOR_IN_CHIEF", "부편집장"),
    REPORTING_SENIOR_REPORTER: t(
      "role.REPORTING_SENIOR_REPORTER",
      "취재부 책임기자",
    ),
    SENIOR_DESIGNER: t("role.SENIOR_DESIGNER", "책임 디자이너"),
    DIGITAL_SENIOR_REPORTER: t(
      "role.DIGITAL_SENIOR_REPORTER",
      "디지털콘텐츠부 책임기자",
    ),
    REPORTING_REPORTER: t("role.REPORTING_REPORTER", "취재부 정기자"),
    DESIGNER: t("role.DESIGNER", "디자이너"),
    DIGITAL_REPORTER: t("role.DIGITAL_REPORTER", "디지털콘텐츠부 정기자"),
    CUB_REPORTER: t("role.CUB_REPORTER", "수습기자"),
    ALUMNI: t("role.ALUMNI", "거쳐간 사람"),
  };
}
