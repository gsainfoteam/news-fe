import { type ReactNode } from "react";

import {
  ExternalLinkIcon,
  InboxIcon,
  LogOutIcon,
  NewspaperIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button, buttonVariants } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { cn } from "@/common/lib/cn";
import { localizePath } from "@/common/lib/languages";
import { getRoleLabels, type User } from "@/features/auth";

import {
  type AdminNavItem,
  type AdminSection,
  getAdminNav,
} from "../../../viewmodels/admin-nav";

const ICONS: Record<AdminSection, ReactNode> = {
  articles: <NewspaperIcon />,
  reports: <InboxIcon />,
  members: <UsersIcon />,
};

export function AdminLayout({ user, section, children }: AdminLayout.Props) {
  const { t, i18n } = useTranslation();
  const nav = getAdminNav(t, i18n.language, user);
  const siteHref = localizePath(i18n.language, "/");
  const navLabel = t("admin.nav.label", "CMS 메뉴");
  const roleLabel = user.role ? getRoleLabels(t)[user.role] : undefined;

  return (
    <div className="flex min-h-dvh bg-background mobile:flex-col">
      <aside className="sticky top-0 flex h-dvh w-[248px] shrink-0 flex-col gap-5 border-r border-border bg-surface px-3.5 py-5 mobile:hidden">
        <AdminBrand href={siteHref} className="px-2 pt-1" />
        <nav aria-label={navLabel} className="flex flex-col gap-0.5">
          {nav.map((item) => (
            <SideNavLink key={item.section} item={item} current={section} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2.5 rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-2.5">
            <UserAvatar user={user} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{user.name}</span>
              {roleLabel && (
                <span className="text-2xs text-subtle-foreground">
                  {roleLabel}
                </span>
              )}
            </span>
          </div>
          <div className="flex gap-1.5">
            <a
              href={siteHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "grow",
              )}
            >
              <ExternalLinkIcon />
              {t("admin.site", "사이트")}
            </a>
            {/* Login and logout are wired by NEF-9 (account-sdk). */}
            <Button variant="ghost" size="sm">
              <LogOutIcon />
              {t("admin.logout", "로그아웃")}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden h-14 items-center justify-between border-b border-border bg-surface pr-2 pl-4 mobile:flex">
          <AdminBrand href={siteHref} />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
              aria-label={t("admin.accountMenu", "내 계정 메뉴")}
            >
              <UserAvatar user={user} size="sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {user.name}
                  {roleLabel && `, ${roleLabel}`}
                </DropdownMenuLabel>
                <DropdownMenuItem render={<a href={siteHref} />}>
                  <ExternalLinkIcon />
                  {t("admin.site", "사이트")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOutIcon />
                {t("admin.logout", "로그아웃")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <nav
          aria-label={navLabel}
          className="scrollbar-none hidden gap-1 overflow-x-auto border-b border-border px-3 py-2 mobile:flex"
        >
          {nav.map((item) => (
            <a
              key={item.section}
              href={item.href}
              aria-current={item.section === section ? "page" : undefined}
              className="inline-flex h-9 shrink-0 items-center rounded-full px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <main className="flex min-w-0 flex-1 flex-col gap-6 px-10 pt-8 pb-12 mobile:gap-[18px] mobile:px-4 mobile:pt-5 mobile:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export namespace AdminLayout {
  export type Props = {
    user: User;
    /** Highlights this menu; omit for pages outside the menu. */
    section?: AdminSection;
    children: ReactNode;
  };
}

function SideNavLink({
  item,
  current,
}: {
  item: AdminNavItem;
  current?: AdminSection;
}) {
  const { t } = useTranslation();
  return (
    <>
      {item.required === "EDITORSHIP" && (
        <span className="px-2.5 pt-2 pb-1 text-2xs font-bold text-subtle-foreground">
          {t("admin.nav.editorshipOnly", "편집장 전용")}
        </span>
      )}
      <a
        href={item.href}
        aria-current={item.section === current ? "page" : undefined}
        className="flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm font-semibold text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-sm aria-[current=page]:ring-1 aria-[current=page]:ring-border [&_svg]:size-4.5 aria-[current=page]:[&_svg]:text-brand-text"
      >
        {ICONS[item.section]}
        {item.label}
      </a>
    </>
  );
}

export function AdminBrand({ href, className }: AdminBrand.Props) {
  const { t } = useTranslation();
  return (
    <a
      href={href}
      aria-label={t("admin.siteHome", "지스트신문 사이트")}
      className={cn("flex w-fit items-center gap-2.5", className)}
    >
      <img
        src="/logo.png"
        alt=""
        width={450}
        height={114}
        className="h-[22px] w-auto mobile:h-5"
      />
      <Badge variant="solid">CMS</Badge>
    </a>
  );
}

export namespace AdminBrand {
  export type Props = { href: string; className?: string };
}

function UserAvatar({
  user,
  size,
}: {
  user: User;
  size?: Avatar.Props["size"];
}) {
  return (
    <Avatar size={size} aria-hidden="true">
      {user.picture && <AvatarImage src={user.picture} alt="" />}
      <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeader.Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] leading-[1.3] font-extrabold tracking-[-0.025em] mobile:text-[22px]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-subtle-foreground tabular-nums">
            {description}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}

export namespace AdminPageHeader {
  export type Props = {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
  };
}
