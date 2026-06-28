import { useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";

export function ErrorScreen({ variant }: ErrorScreen.Props) {
  const { t } = useTranslation();

  const content =
    variant === "notFound"
      ? {
          status: "404",
          title: t("error:notFound.title", "페이지를 찾을 수 없어요"),
          description: t(
            "error:notFound.description",
            "요청하신 페이지가 존재하지 않거나 이동되었어요.",
          ),
        }
      : {
          status: "500",
          title: t("error:serverError.title", "문제가 발생했어요"),
          description: t(
            "error:serverError.description",
            "잠시 후 다시 시도해 주세요. 문제가 계속되면 신문사로 문의해 주세요.",
          ),
        };

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <span className="text-caption rounded-full bg-neutral-200 px-3 py-1 font-bold text-neutral-600">
        {content.status}
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
        {content.title}
      </h1>
      <p className="max-w-md text-neutral-500">{content.description}</p>
      <Button
        label={t("error:home", "홈으로 돌아가기")}
        href="/"
        variant="primary"
        className="mt-2"
      />
    </section>
  );
}

export namespace ErrorScreen {
  export type Props = {
    variant: "notFound" | "serverError";
  };
}
