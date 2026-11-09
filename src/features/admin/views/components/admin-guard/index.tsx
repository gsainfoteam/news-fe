import { type ReactNode } from "react";

import {
  Loader2Icon,
  LockKeyholeIcon,
  LogInIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/common/components/ui/button";
import { Toaster } from "@/common/components/ui/sonner";
import { cn } from "@/common/lib/cn";
import { localizePath } from "@/common/lib/languages";
import { QueryProvider } from "@/common/lib/query-client";
import { getAdminAccess, type User, useMe } from "@/features/auth";

import {
  type AdminSection,
  getAdminNav,
  getSectionPermission,
} from "../../../viewmodels/admin-nav";
import { AdminBrand, AdminLayout } from "../admin-layout";

// Every CMS page is one `client:only` island rooted here, so the guard also
// provides the shared query cache and the toast outlet.
export function AdminGuard(props: AdminGuard.Props) {
  return (
    <QueryProvider>
      <AdminGuardContent {...props} />
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

function AdminGuardContent({ section, children }: AdminGuard.Props) {
  const { t } = useTranslation();
  const session = useMe();

  switch (session.status) {
    case "loading":
      return (
        <StandaloneScreen>
          <div role="status" className="flex flex-col items-center gap-3">
            <Loader2Icon className="size-6 animate-spin text-subtle-foreground" />
            <span className="sr-only">
              {t("admin.guard.loading", "불러오는 중")}
            </span>
          </div>
        </StandaloneScreen>
      );
    // NEF-12 replaces this with the shared error screen.
    case "error":
      return (
        <StandaloneScreen>
          <StateMessage
            icon={<TriangleAlertIcon />}
            title={t(
              "admin.guard.error.title",
              "계정 정보를 불러오지 못했습니다",
            )}
            description={t(
              "admin.guard.error.description",
              "잠시 뒤 다시 시도해 주세요.",
            )}
          >
            <Button onClick={session.retry}>
              {t("admin.guard.error.retry", "다시 시도")}
            </Button>
          </StateMessage>
        </StandaloneScreen>
      );
    case "anonymous":
      return (
        <StandaloneScreen>
          <LoginRequired />
        </StandaloneScreen>
      );
  }

  const { user } = session;
  const access = getAdminAccess(user, getSectionPermission(section));
  if (access === "not-member") {
    return (
      <StandaloneScreen>
        <NotMember user={user} />
      </StandaloneScreen>
    );
  }
  return (
    <AdminLayout user={user} section={section}>
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

function LoginRequired() {
  const { t, i18n } = useTranslation();
  return (
    <StateMessage
      icon={<LockKeyholeIcon />}
      title={t("admin.guard.login.title", "기자 로그인이 필요합니다")}
      description={t(
        "admin.guard.login.description",
        "CMS는 지스트신문 멤버만 쓸 수 있습니다. 인포팀 계정으로 로그인해 주세요.",
      )}
    >
      {/* NEF-9 starts the account-sdk login here. */}
      <Button>
        <LogInIcon />
        {t("admin.guard.login.action", "인포팀 계정으로 로그인")}
      </Button>
      <SiteLink lng={i18n.language} />
    </StateMessage>
  );
}

function NotMember({ user }: { user: User }) {
  const { t, i18n } = useTranslation();
  return (
    <StateMessage
      icon={<ShieldAlertIcon />}
      title={t("admin.guard.notMember.title", "CMS를 쓸 수 없는 계정입니다")}
      description={t(
        "admin.guard.notMember.description",
        "{{email}} 계정은 지스트신문 멤버로 등록되어 있지 않습니다. 멤버 등록은 편집장에게 요청해 주세요.",
        { email: user.email },
      )}
    >
      <SiteLink lng={i18n.language} />
    </StateMessage>
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
      <StateMessage
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
      </StateMessage>
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

function StateMessage({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center gap-4 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-6"
      >
        {icon}
      </span>
      <h1 className="text-h3">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      {children && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
