import { ChevronDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { buttonVariants } from "@/common/components/ui/button";
import { cn } from "@/common/lib/cn";

import { type Category } from "../../../models";
import { getCategoryNav } from "../../../viewmodels/category";

const linkClass =
  "relative inline-flex h-[50px] items-center gap-1 px-3.5 text-[15px] font-semibold whitespace-nowrap text-foreground group-first/item:pl-0 mobile:h-[46px] mobile:px-3 mobile:group-first/item:pl-0 aria-[current=page]:text-brand-text aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3.5 aria-[current=page]:after:-bottom-px aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-primary group-first/item:aria-[current=page]:after:left-0 mobile:aria-[current=page]:after:inset-x-3";

// Hover or keyboard focus opens the dropdown with CSS only, so the bar ships
// as static HTML with no hydration. Touch widths scroll the bar instead.
export function CategoryNav({ current, className }: CategoryNav.Props) {
  const { t, i18n } = useTranslation();
  const { groups, notice } = getCategoryNav(t, i18n.language, current);

  return (
    <nav
      aria-label={t("category.navLabel", "카테고리")}
      className={cn(
        "flex items-center gap-0.5 border-t border-border mobile:scrollbar-none mobile:gap-0 mobile:overflow-x-auto",
        className,
      )}
    >
      {groups.map((group) => (
        <div key={group.category} className="group/item relative">
          <a
            href={group.href}
            aria-current={group.current ? "page" : undefined}
            className={linkClass}
          >
            {group.label}
            {group.children.length > 0 && (
              <ChevronDownIcon
                aria-hidden="true"
                className="size-3.5 text-subtle-foreground transition-transform group-focus-within/item:rotate-180 group-hover/item:rotate-180 mobile:hidden"
              />
            )}
          </a>
          {group.children.length > 0 && (
            <div className="invisible absolute top-full left-0 z-40 pt-1 opacity-0 transition-opacity group-focus-within/item:visible group-focus-within/item:opacity-100 group-hover/item:visible group-hover/item:opacity-100 mobile:hidden">
              <div className="grid w-max grid-cols-[160px_minmax(8rem,max-content)] gap-4 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
                <div className="flex flex-col items-start gap-2 p-1">
                  <p className="text-xs font-bold text-brand-text">
                    {group.label}
                  </p>
                  {group.description && (
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                  <a
                    href={group.href}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "mt-auto",
                    )}
                  >
                    {t("category.viewAll", "전체 보기")}
                  </a>
                </div>
                <ul className="flex flex-col">
                  {group.children.map((child) => (
                    <li key={child.category}>
                      <a
                        href={child.href}
                        aria-current={child.current ? "page" : undefined}
                        className="flex h-9 items-center rounded-md px-2.5 text-sm text-foreground hover:bg-accent focus-visible:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-brand-text"
                      >
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
      <a
        href={notice.href}
        aria-current={notice.current ? "page" : undefined}
        className="ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground aria-[current=page]:text-brand-text mobile:hidden"
      >
        {notice.label}
      </a>
    </nav>
  );
}

export namespace CategoryNav {
  export type Props = {
    current?: Category;
    className?: string;
  };
}
