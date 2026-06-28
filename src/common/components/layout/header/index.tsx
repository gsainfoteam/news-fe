import { IconButton } from "@/common/components/ui/icon-button";
import { SearchInput } from "@/common/components/ui/search-input";
import { buildNavItems } from "@/features/category";

import { NavigationBar } from "../navigation-bar";

export function Header({ currentPath = "/" }: Header.Props) {
  const navItems = buildNavItems(currentPath);

  return (
    <header
      id="site-header"
      className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md transition-transform duration-200 ease-out will-change-transform"
    >
      <div className="mx-auto max-w-7xl px-6 py-4" data-header-main>
        <div className="flex items-center justify-between gap-4">
          <div className="flex shrink-0 items-center">
            <a
              href="/"
              aria-label="홈으로 이동"
              className="inline-block cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:outline-none"
            >
              <img
                src="/logo.png"
                width={120}
                alt="지스트신문"
                className="block"
              />
            </a>
          </div>

          <SearchInput className="max-w-2xl flex-1" />

          <div className="flex shrink-0 items-center gap-4">
            <IconButton icon="gear" label="설정" />
            <IconButton icon="user" label="사용자 계정" />
          </div>
        </div>
      </div>

      <div data-header-nav>
        <NavigationBar items={navItems} />
      </div>
    </header>
  );
}

export namespace Header {
  export type Props = {
    /** Current route path, used to highlight the active nav item. */
    currentPath?: string;
  };
}
