import { useEffect, useRef } from "react";

import { CheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "@/common/components/ui/button";
import { cn } from "@/common/lib/cn";

export function ReportComplete({
  homeHref,
  onReset,
  autoFocus,
}: ReportComplete.Props) {
  const { t } = useTranslation();
  const heading = useRef<HTMLParagraphElement>(null);

  // The form this replaces held focus; move it here so screen readers
  // announce the result.
  useEffect(() => {
    if (autoFocus) heading.current?.focus();
  }, [autoFocus]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border px-6 py-12 text-center">
      <span className="flex size-13 items-center justify-center rounded-full bg-success-soft text-success [&>svg]:size-5.5">
        <CheckIcon aria-hidden="true" />
      </span>
      <p ref={heading} tabIndex={-1} className="text-h3 outline-none">
        {t("report.complete.title", "제보가 접수되었습니다")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t(
          "report.complete.description",
          "소중한 제보 감사합니다. 기자가 확인한 뒤 필요하면 남겨주신 연락처로 연락드리겠습니다.",
        )}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <a
          href={homeHref}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {t("report.complete.home", "홈으로")}
        </a>
        <Button type="button" variant="ghost" onClick={onReset}>
          {t("report.complete.again", "새 제보 작성")}
        </Button>
      </div>
    </div>
  );
}

export namespace ReportComplete {
  export type Props = {
    homeHref: string;
    onReset: () => void;
    autoFocus?: boolean;
  };
}
