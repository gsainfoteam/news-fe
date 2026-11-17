import { type ReactNode, useMemo } from "react";

import {
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  RotateCwIcon,
  UserIcon,
} from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { Skeleton } from "@/common/components/ui/skeleton";
import { i18n as appI18n, getPageI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import { QueryProvider } from "@/common/lib/query-client";

import { type User } from "../../../models";
import { AuthProvider } from "../../../viewmodels/auth-provider";
import { isActiveMember } from "../../../viewmodels/permission";
import { useSession } from "../../../viewmodels/use-session";

export function AccountMenu({ lng }: AccountMenu.Props) {
  const i18n = useMemo(() => (lng ? getPageI18n(lng) : appI18n), [lng]);
  return (
    <I18nextProvider i18n={i18n}>
      <QueryProvider>
        <AuthProvider>
          <AccountMenuContent />
        </AuthProvider>
      </QueryProvider>
    </I18nextProvider>
  );
}

export namespace AccountMenu {
  export type Props = {
    lng?: string;
  };
}

export function AccountMenuSkeleton() {
  return (
    <Skeleton
      aria-hidden="true"
      className="h-8 w-[66px] rounded-md mobile:size-10 mobile:rounded-full"
    />
  );
}

function AccountMenuContent() {
  const { t } = useTranslation();
  const session = useSession();

  switch (session.status) {
    case "loading":
      return <AccountMenuSkeleton />;
    case "anonymous": {
      const label = t("auth.login", "로그인");
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={session.login}
            className="mobile:hidden"
          >
            {label}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={session.login}
            aria-label={label}
            className="hidden mobile:inline-flex"
          >
            <LogInIcon />
          </Button>
        </>
      );
    }
    case "error":
      return (
        <ProfileMenu>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              {t("auth.menu.error", "계정 정보를 불러오지 못했습니다")}
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={session.retry}>
              <RotateCwIcon />
              {t("error.retry", "다시 시도")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <LogoutItem onLogout={session.logout} />
        </ProfileMenu>
      );
    case "authenticated":
      return (
        <ProfileMenu user={session.user}>
          <AuthenticatedItems user={session.user} />
          <DropdownMenuSeparator />
          <LogoutItem onLogout={session.logout} />
        </ProfileMenu>
      );
  }
}

function ProfileMenu({ user, children }: { user?: User; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full hover:bg-transparent hover:opacity-80 mobile:size-10"
          />
        }
        aria-label={t("auth.menu.label", "내 계정 메뉴")}
      >
        <Avatar size="sm" aria-hidden="true">
          {user?.picture && <AvatarImage src={user.picture} alt="" />}
          <AvatarFallback>
            {user ? user.name.slice(0, 1) : <UserIcon />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthenticatedItems({ user }: { user: User }) {
  const { t, i18n } = useTranslation();
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel className="flex flex-col gap-0.5">
        <span className="truncate text-sm font-bold text-foreground">
          {user.nickname ?? user.name}
        </span>
        <span className="truncate">{user.email}</span>
      </DropdownMenuLabel>
      {isActiveMember(user) && (
        <DropdownMenuItem
          render={<a href={localizePath(i18n.language, "/admin")} />}
        >
          <LayoutDashboardIcon />
          {t("auth.menu.cms", "CMS 열기")}
        </DropdownMenuItem>
      )}
    </DropdownMenuGroup>
  );
}

function LogoutItem({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation();
  return (
    <DropdownMenuItem onClick={onLogout}>
      <LogOutIcon />
      {t("auth.logout", "로그아웃")}
    </DropdownMenuItem>
  );
}
