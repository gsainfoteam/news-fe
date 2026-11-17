import { type ReactNode } from "react";

import { LogOutIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import { Separator } from "@/common/components/ui/separator";
import { useDayjs } from "@/common/lib/dayjs";

import { type User } from "../../../models";
import { getRoleLabels } from "../../../viewmodels/role";
import { NicknameForm } from "../nickname-form";
import { RequireAuth } from "../require-auth";

// The `/me` island. RequireAuth brings the query cache it shares with the
// header, so a nickname saved here shows in the account menu at once.
export function MyPage() {
  return (
    <RequireAuth>
      {({ user, logout }) => <MyProfile user={user} onLogout={logout} />}
    </RequireAuth>
  );
}

function MyProfile({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { t } = useTranslation();
  const dayjs = useDayjs();
  const role = user.role ? getRoleLabels(t)[user.role] : undefined;
  const date = (value: Date) => dayjs(value).format("LL");

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-8 pt-12 pb-20 mobile:pt-8 mobile:pb-14">
      <h1 className="text-h1">{t("auth.me.title", "내 정보")}</h1>

      <section className="flex items-center gap-4">
        <Avatar size="lg" aria-hidden="true" className="size-16 text-h3">
          {user.picture && <AvatarImage src={user.picture} alt="" />}
          <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-h4">{user.nickname ?? user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </section>

      <NicknameForm user={user} />

      <Separator />

      <dl className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3 text-sm mobile:gap-x-5">
        <Row label={t("auth.me.name", "이름")}>{user.name}</Row>
        <Row label={t("auth.me.email", "이메일")}>{user.email}</Row>
        {role && <Row label={t("auth.me.role", "직책")}>{role}</Row>}
        <Row label={t("auth.me.joined", "가입일")}>{date(user.createdAt)}</Row>
        {user.termsAgreedAt && (
          <Row label={t("auth.me.agreed", "약관 동의일")}>
            {date(user.termsAgreedAt)}
          </Row>
        )}
      </dl>
      <p className="-mt-4 text-xs text-subtle-foreground">
        {t(
          "auth.me.accountNote",
          "이름과 이메일은 인포팀 계정에서 가져옵니다. 바꾸려면 인포팀 계정에서 고쳐 주세요.",
        )}
      </p>

      <div>
        <Button variant="outline" onClick={onLogout}>
          <LogOutIcon />
          {t("auth.logout", "로그아웃")}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}
