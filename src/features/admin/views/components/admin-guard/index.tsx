import { type ReactNode } from "react";

import { LockKeyholeIcon, LogInIcon, ShieldAlertIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/common/components/ui/button";
import { Toaster } from "@/common/components/ui/sonner";
import { cn } from "@/common/lib/cn";
import { localizePath } from "@/common/lib/languages";
import { QueryProvider } from "@/common/lib/query-client";
import {
  AuthMessage,
  getAdminAccess,
  RequireAuth,
  type User,
} from "@/features/auth";

import {
  type AdminSection,
  getAdminNav,
  getSectionPermission,
} from "../../../viewmodels/admin-nav";
import { AdminBrand, AdminLayout } from "../admin-layout";

// Every CMS page is one `client:only` island rooted here, so the guard also
// provides the shared query cache and the toast outlet.
export function AdminGuard({ section, children }: AdminGuard.Props) {
  return (
    <QueryProvider>
      <RequireAuth
        frame={(screen) => <StandaloneScreen>{screen}</StandaloneScreen>}
        loginScreen={(login) => <LoginRequired onLogin={login} />}
      >
        {({ user, logout }) => (
          <AdminGuardContent user={user} section={section} onLogout={logout}>
            {children}
          </AdminGuardContent>
        )}
      </RequireAuth>
      <Toaster position="bottom-center" />
    </QueryProvider>
  );
}

export namespace AdminGuard {
  export type Props = {
    /** The menu this page belongs to; its permission gates the page. */
    section: AdminSection;
    children: ReactNode | ((user: User) => ReactNode);
  };
}

function AdminGuardContent({
  user,
  section,
  onLogout,
  children,
}: AdminGuard.Props & { user: User; onLogout: () => void }) {
  const access = getAdminAccess(user, getSectionPermission(section));
  if (access === "not-member") {
    return (
      <StandaloneScreen>
        <NotMember user={user} />
      </StandaloneScreen>
    );
  }
  return (
    <AdminLayout user={user} section={section} onLogout={onLogout}>
      {access === "forbidden" ? (
        <Forbidden user={user} section={section} />
      ) : typeof children === "function" ? (
        children(user)
      ) : (
        children
      )}
    </AdminLayout>
  );
}

function LoginRequired({ onLogin }: { onLogin: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <AuthMessage
      icon={<LockKeyholeIcon />}
      title={t("admin.guard.login.title", "기자 로그인이 필요합니다")}
      description={t(
        "admin.guard.login.description",
        "CMS는 지스트신문 멤버만 쓸 수 있습니다. 인포팀 계정으로 로그인해 주세요.",
      )}
    >
      <Button onClick={onLogin}>
        <LogInIcon />
        {t("admin.guard.login.action", "인포팀 계정으로 로그인")}
      </Button>
      <SiteLink lng={i18n.language} />
    </AuthMessage>
  );
}

function NotMember({ user }: { user: User }) {
  const { t, i18n } = useTranslation();
  return (
    <AuthMessage
      icon={<ShieldAlertIcon />}
      title={t("admin.guard.notMember.title", "CMS를 쓸 수 없는 계정입니다")}
      description={t(
        "admin.guard.notMember.description",
        "{{email}} 계정은 지스트신문 멤버로 등록되어 있지 않습니다. 멤버 등록은 편집장에게 요청해 주세요.",
        { email: user.email },
      )}
    >
      <SiteLink lng={i18n.language} />
    </AuthMessage>
  );
}

function Forbidden({ user, section }: { user: User; section: AdminSection }) {
  const { t, i18n } = useTranslation();
  const fallback = getAdminNav(t, i18n.language, user)[0];
  const description =
    getSectionPermission(section) === "EDITORSHIP"
      ? t(
          "admin.guard.forbidden.editorship",
          "이 메뉴는 편집장만 쓸 수 있습니다.",
        )
      : t(
          "admin.guard.forbidden.editor",
          "이 메뉴는 편집 권한이 있는 멤버만 쓸 수 있습니다. 권한은 직책에 따라 정해지며, 편집장이 바꿀 수 있습니다.",
        );
  return (
    <div className="py-16 mobile:py-10">
      <AuthMessage
        icon={<LockKeyholeIcon />}
        title={t("admin.guard.forbidden.title", "접근 권한이 없습니다")}
        description={description}
      >
        {fallback && (
          <a href={fallback.href} className={cn(buttonVariants())}>
            {t("admin.guard.forbidden.action", "{{menu}} 열기", {
              menu: fallback.label,
            })}
          </a>
        )}
      </AuthMessage>
    </div>
  );
}

function SiteLink({ lng }: { lng: string }) {
  const { t } = useTranslation();
  return (
    <a
      href={localizePath(lng, "/")}
      className={cn(buttonVariants({ variant: "outline" }))}
    >
      {t("admin.guard.toSite", "사이트로 돌아가기")}
    </a>
  );
}

function StandaloneScreen({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex h-16 items-center border-b border-border bg-surface px-6 mobile:h-14 mobile:px-4">
        <AdminBrand href={localizePath(i18n.language, "/")} />
      </div>
      <main className="flex flex-1 justify-center px-4 pt-[120px] pb-[140px] mobile:pt-20 mobile:pb-24">
        {children}
      </main>
    </div>
  );
}
