import { type i18n as I18n } from "i18next";
import { SearchIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { buttonVariants } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { cn } from "@/common/lib/cn";
import { i18n as appI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";

// Own React root under Astro; see Header for why i18n is a prop.
export function NotFound({ i18n = appI18n }: NotFound.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <NotFoundContent />
    </I18nextProvider>
  );
}

function NotFoundContent() {
  const { t, i18n } = useTranslation();
  const path = (to: string) => localizePath(i18n.language, to);
  const searchLabel = t("header.search", "기사 검색");

  return (
    <div className="mx-auto flex max-w-[696px] flex-col items-start gap-4 pt-22 mobile:pt-14">
      <p
        aria-hidden="true"
        className="text-[120px] leading-none font-bold tracking-[-0.04em] text-brand-text mobile:text-[88px]"
      >
        404
      </p>
      <h1 className="text-h1">
        {t("notFound.title", "페이지를 찾을 수 없습니다")}
      </h1>
      <p className="text-muted-foreground">
        {t(
          "notFound.description",
          "주소가 바뀌었거나 삭제된 기사일 수 있습니다. 방금 발행된 기사는 사이트에 반영되기까지 1~2분 걸립니다.",
        )}
      </p>
      <div className="mt-2 flex w-full flex-wrap gap-2">
        <a href={path("/")} className={cn(buttonVariants())}>
          {t("notFound.home", "홈으로 가기")}
        </a>
        {/* The search page reads `q`, as the header search form does. */}
        <form
          role="search"
          action={path("/search")}
          className="w-[280px] mobile:w-full"
        >
          <Input
            type="search"
            name="q"
            icon={<SearchIcon />}
            placeholder={searchLabel}
            aria-label={searchLabel}
          />
        </form>
      </div>
    </div>
  );
}

export namespace NotFound {
  export type Props = {
    i18n?: I18n;
  };
}
