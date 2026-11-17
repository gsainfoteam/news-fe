import { ExternalLinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { buttonVariants } from "@/common/components/ui/button";
import { ErrorState } from "@/common/components/ui/error-state";
import { Skeleton } from "@/common/components/ui/skeleton";
import { localizePath } from "@/common/lib/languages";
import { AdminGuard, AdminPageHeader } from "@/features/admin";

import { toAboutFormValues } from "../../../viewmodels/about-form";
import { useAbout } from "../../../viewmodels/use-about";
import { AboutInfoForm } from "../about-info-form";
import { HistoryEditor } from "../history-editor";

export function AdminAbout() {
  return (
    <AdminGuard section="about">
      <AboutManagement />
    </AdminGuard>
  );
}

export function AboutManagement() {
  const { t, i18n } = useTranslation();
  const about = useAbout();

  // The reader page is static, so every change waits for news-be's rebuild.
  const published = (message: string) =>
    toast.success(message, {
      description: t(
        "about.toast.rebuild",
        "사이트에는 1~2분 뒤에 반영됩니다.",
      ),
    });
  const run = async <T,>(
    action: () => Promise<T>,
    success: string,
    failure: string,
  ) => {
    try {
      await action();
    } catch (error) {
      toast.error(failure, {
        description: t("error.description", "잠시 후 다시 시도해 주세요."),
      });
      throw error;
    }
    published(success);
  };

  return (
    <>
      <AdminPageHeader
        title={t("about.admin.title", "신문 소개")}
        description={t(
          "about.admin.description",
          "신문 소개 페이지의 소개 문구, 발행 정보, 연혁을 고칩니다",
        )}
        actions={
          <a
            href={localizePath(i18n.language, "/about")}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <ExternalLinkIcon />
            {t("about.admin.viewPage", "페이지 보기")}
            <span className="sr-only">
              {t("footer.newTab", "(새 탭에서 열림)")}
            </span>
          </a>
        }
      />

      {about.status === "pending" ? (
        <FormSkeleton />
      ) : about.status === "error" || !about.about ? (
        <ErrorState
          title={t("about.admin.loadFailed", "신문 소개를 불러오지 못했습니다")}
          description={t("error.description", "잠시 후 다시 시도해 주세요.")}
          retryLabel={t("error.retry", "다시 시도")}
          onRetry={about.retry}
        />
      ) : (
        <>
          <AboutInfoForm
            // Remount on a new server copy so the form starts from it.
            key={JSON.stringify(toAboutFormValues(about.about))}
            saved={toAboutFormValues(about.about)}
            onSave={(changes) =>
              run(
                () => about.saveAbout(changes),
                t("about.toast.saved", "소개를 저장했습니다"),
                t("about.toast.saveFailed", "소개를 저장하지 못했습니다"),
              )
            }
          />
          <HistoryEditor
            entries={about.about.histories}
            onAdd={(entry) =>
              run(
                () => about.addHistory(entry),
                t("about.toast.historyAdded", "연혁을 추가했습니다"),
                t("about.toast.historyAddFailed", "연혁을 추가하지 못했습니다"),
              )
            }
            onUpdate={(id, entry) =>
              run(
                () => about.updateHistory(id, entry),
                t("about.toast.historyUpdated", "연혁을 고쳤습니다"),
                t(
                  "about.toast.historyUpdateFailed",
                  "연혁을 고치지 못했습니다",
                ),
              )
            }
            onDelete={(id) =>
              run(
                () => about.deleteHistory(id),
                t("about.toast.historyDeleted", "연혁을 삭제했습니다"),
                t(
                  "about.toast.historyDeleteFailed",
                  "연혁을 삭제하지 못했습니다",
                ),
              )
            }
          />
        </>
      )}
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-[18px]">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-4 gap-4 mobile:grid-cols-1">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
