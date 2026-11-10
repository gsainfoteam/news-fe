import { type ReactNode } from "react";

import { useTranslation } from "react-i18next";

import { getRoleLabels } from "@/features/auth";

import {
  ACCESS_LEVELS,
  type AccessLevel,
  getAccessLabels,
  getRolesByAccess,
} from "../../../viewmodels/member-role";
import { AccessBadge } from "../access-badge";

// What each permission level may do, mirroring news-be's guards. Bold items
// are the ones only that level has.
export function MemberPermissions() {
  const { t } = useTranslation();
  const roleLabels = getRoleLabels(t);
  const groups = getRolesByAccess();
  const can: Record<AccessLevel, ReactNode[]> = {
    EDITORSHIP: [
      t("member.can.allEditor", "편집 권한 전부"),
      <b key="register">{t("member.can.register", "멤버 등록")}</b>,
      <b key="role">{t("member.can.changeRole", "직책 변경")}</b>,
      <b key="delete">{t("member.can.delete", "멤버 삭제")}</b>,
    ],
    EDITOR: [
      t("member.can.writeArticle", "기사 작성"),
      t("member.can.editArticle", "기사 수정과 삭제"),
      t("member.can.deleteComment", "다른 사람 댓글 삭제"),
      t("member.can.readReports", "제보 보기"),
    ],
    NONE: [t("member.can.readReports", "제보 보기")],
    ALUMNI: [
      t("member.can.noCms", "CMS 접근 불가"),
      t("member.can.stayListed", "멤버 목록에는 남음"),
    ],
  };

  return (
    <section
      aria-labelledby="member-permissions-title"
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border px-[18px] py-3.5">
        <h2
          id="member-permissions-title"
          className="text-[15px] font-extrabold"
        >
          {t("member.permissions.title", "권한")}
        </h2>
        <span className="text-2xs text-subtle-foreground">
          {t(
            "member.permissions.description",
            "권한은 직책에 따라 자동으로 정해집니다",
          )}
        </span>
      </div>
      <ul>
        {ACCESS_LEVELS.map((level) => (
          <li
            key={level}
            className="grid grid-cols-[96px_minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-4 border-t border-border px-[18px] py-3 text-sm leading-normal first:border-t-0 mobile:grid-cols-1 mobile:gap-1.5 mobile:px-4 mobile:py-3.5"
          >
            <AccessBadge level={level} label={getAccessLabels(t)[level]} />
            <span className="font-semibold">
              {groups[level].map((role) => roleLabels[role]).join(", ")}
            </span>
            <ul className="flex flex-wrap gap-x-[18px] gap-y-0.5 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">
              {can[level].map((item, i) => (
                <li
                  key={i}
                  className="relative pl-3 whitespace-nowrap before:absolute before:top-[0.7em] before:left-0 before:size-1 before:rounded-full before:bg-current"
                >
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
