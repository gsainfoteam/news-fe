import { GlobeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { buttonVariants } from "@/common/components/ui/button";
import { cn } from "@/common/lib/cn";
import { getLanguageSwitch } from "@/common/lib/languages";

// A link, not a menu: the header ships no JS. `bindLanguageSwitch` adds the query.
export function LanguageSwitch({
  currentPath,
  className,
}: LanguageSwitch.Props) {
  const { i18n } = useTranslation();
  const target = getLanguageSwitch(
    i18n.language,
    currentPath ?? currentLocation(),
  );

  return (
    <a
      href={target.href}
      hrefLang={target.lng}
      lang={target.lng}
      data-language-switch={target.lng}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        className,
      )}
    >
      <GlobeIcon aria-hidden="true" />
      {target.name}
    </a>
  );
}

export namespace LanguageSwitch {
  export type Props = {
    currentPath?: string;
    className?: string;
  };
}

function currentLocation() {
  return typeof window === "undefined"
    ? "/"
    : window.location.pathname + window.location.search;
}
