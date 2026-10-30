import { type ReactNode } from "react";

import { type i18n as I18n } from "i18next";
import { SearchIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { buttonVariants } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { cn } from "@/common/lib/cn";
import { i18n as appI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import { CategoryNav, type Category } from "@/features/category";

// Astro renders this as its own React root, so the page passes its i18n
// instance in; stories fall back to the shared one the toolbar drives.
export function Header({ i18n = appI18n, ...props }: Header.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <HeaderContent {...props} />
    </I18nextProvider>
  );
}

function HeaderContent({ currentCategory, account, menu }: Header.Props) {
  const { t, i18n } = useTranslation();
  const path = (to: string) => localizePath(i18n.language, to);
  const searchLabel = t("header.search", "기사 검색");

  return (
    <header className="border-b border-border bg-background">
      <div className="page-container">
        <div className="flex h-[76px] items-center justify-between gap-6 mobile:h-[60px] mobile:gap-2">
          <a
            href={path("/")}
            aria-label={t("header.home", "지스트신문 홈")}
            className="shrink-0"
          >
            <img
              src="/logo.png"
              alt=""
              width={450}
              height={114}
              className="h-[30px] w-auto mobile:h-6"
            />
          </a>
          <div className="flex items-center gap-2">
            <form
              role="search"
              action={path("/search")}
              className="w-[248px] mobile:hidden"
            >
              <Input
                type="search"
                name="q"
                icon={<SearchIcon />}
                placeholder={searchLabel}
                aria-label={searchLabel}
                className="h-[38px] rounded-full bg-surface"
              />
            </form>
            <a
              href={path("/report")}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mobile:hidden",
              )}
            >
              {t("header.report", "제보하기")}
            </a>
            {account && <div className="mobile:hidden">{account}</div>}
            <a
              href={path("/search")}
              aria-label={searchLabel}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "hidden mobile:inline-flex",
              )}
            >
              <SearchIcon />
            </a>
            {menu && <div className="hidden mobile:flex">{menu}</div>}
          </div>
        </div>
        <CategoryNav current={currentCategory} />
      </div>
    </header>
  );
}

export namespace Header {
  export type Props = {
    i18n?: I18n;
    currentCategory?: Category;
    /** Login button or user menu; the login issue hydrates it as an island. */
    account?: ReactNode;
    /** Mobile menu trigger (an island), shown only at mobile width. */
    menu?: ReactNode;
  };
}
