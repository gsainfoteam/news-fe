import { useMemo } from "react";

import { MenuIcon, SearchIcon, XIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Separator } from "@/common/components/ui/separator";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/common/components/ui/sheet";
import { cn } from "@/common/lib/cn";
import { i18n as appI18n, getPageI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import { getCategoryNav, type Category } from "@/features/category";

// An island can't receive the page's i18n instance (props are serialized),
// so it takes the page language and builds its own; otherwise the build
// renders it with the shared Korean instance on /en/ pages too.
export function MobileMenu({ lng, ...props }: MobileMenu.Props) {
  const i18n = useMemo(() => (lng ? getPageI18n(lng) : appI18n), [lng]);
  return (
    <I18nextProvider i18n={i18n}>
      <MobileMenuContent {...props} />
    </I18nextProvider>
  );
}

function MobileMenuContent({ currentCategory, defaultOpen }: MobileMenu.Props) {
  const { t, i18n } = useTranslation();
  const { groups, notice } = getCategoryNav(t, i18n.language, currentCategory);
  const path = (to: string) => localizePath(i18n.language, to);
  const searchLabel = t("header.search", "기사 검색");

  return (
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("header.openMenu", "메뉴 열기")}
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <img
              src="/logo.png"
              alt={t("site.name", "지스트신문")}
              width={450}
              height={114}
              className="h-[22px] w-auto"
            />
          </SheetTitle>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("header.closeMenu", "메뉴 닫기")}
              />
            }
          >
            <XIcon />
          </SheetClose>
        </SheetHeader>
        <SheetBody>
          <form role="search" action={path("/search")}>
            <Input
              type="search"
              name="q"
              icon={<SearchIcon />}
              placeholder={searchLabel}
              aria-label={searchLabel}
            />
          </form>
          <nav aria-label={t("category.navLabel", "카테고리")}>
            <ul className="flex flex-col">
              {[...groups, { ...notice, children: [] }].map((group) => (
                <li key={group.category}>
                  <a
                    href={group.href}
                    aria-current={group.current ? "page" : undefined}
                    className="flex h-11 items-center font-bold aria-[current=page]:text-brand-text"
                  >
                    {group.label}
                  </a>
                  {group.children.length > 0 && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 pb-2.5 pl-3 text-sm text-muted-foreground">
                      {group.children.map((child) => (
                        <li key={child.category}>
                          <a
                            href={child.href}
                            aria-current={child.current ? "page" : undefined}
                            className="aria-[current=page]:font-semibold aria-[current=page]:text-brand-text"
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <Separator />
          <a
            href={path("/report")}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            {t("header.report", "제보하기")}
          </a>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export namespace MobileMenu {
  export type Props = {
    lng?: string;
    currentCategory?: Category;
    defaultOpen?: boolean;
  };
}
