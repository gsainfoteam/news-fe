import { useState } from "react";

import { UploadIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { Button } from "@/common/components/ui/button";
import { ErrorState } from "@/common/components/ui/error-state";
import { Skeleton } from "@/common/components/ui/skeleton";
import { AdminGuard, AdminPageHeader } from "@/features/admin";

import { type Newspaper } from "../../../models";
import { suggestNextTitle } from "../../../viewmodels/archive";
import { type NewspaperFormValues } from "../../../viewmodels/newspaper-form";
import { useAdminNewspapers } from "../../../viewmodels/use-admin-newspapers";
import { NewspaperFormDialog } from "../newspaper-form-dialog";
import { NewspaperTable } from "../newspaper-table";

export function AdminNewspapers() {
  return (
    <AdminGuard section="archive">
      <NewspaperManagement />
    </AdminGuard>
  );
}

type Editing = { open: boolean; target?: Newspaper };

export function NewspaperManagement() {
  const { t } = useTranslation();
  const list = useAdminNewspapers();
  const [editing, setEditing] = useState<Editing>({ open: false });
  const [deleting, setDeleting] = useState<Editing>({ open: false });

  const save = async (values: NewspaperFormValues) => {
    try {
      await list.save(values, editing.target);
    } catch (error) {
      toast.error(
        editing.target
          ? t("newspaper.toast.saveFailed", "지면을 저장하지 못했습니다")
          : t("newspaper.toast.uploadFailed", "지면을 올리지 못했습니다"),
        { description: t("error.description", "잠시 후 다시 시도해 주세요.") },
      );
      throw error;
    }
    setEditing((e) => ({ ...e, open: false }));
    toast.success(
      editing.target
        ? t("newspaper.toast.saved", "{{title}} 지면을 저장했습니다", {
            title: values.title.trim(),
          })
        : t("newspaper.toast.uploaded", "{{title}} 지면을 올렸습니다", {
            title: values.title.trim(),
          }),
    );
  };

  const confirmDelete = async () => {
    const target = deleting.target;
    if (!target) return;
    try {
      await list.deleteNewspaper(target.id);
      setDeleting((d) => ({ ...d, open: false }));
      toast.success(
        t("newspaper.toast.deleted", "{{title}} 지면을 삭제했습니다", {
          title: target.title,
        }),
      );
    } catch {
      toast.error(
        t("newspaper.toast.deleteFailed", "지면을 삭제하지 못했습니다"),
        { description: t("error.description", "잠시 후 다시 시도해 주세요.") },
      );
    }
  };

  return (
    <>
      <AdminPageHeader
        title={t("newspaper.title", "지면 PDF")}
        description={
          list.status === "success" &&
          t("newspaper.count", "지면 {{count}}개", {
            count: list.newspapers.length,
          })
        }
        actions={
          list.status === "success" && (
            <Button onClick={() => setEditing({ open: true })}>
              <UploadIcon />
              {t("newspaper.upload", "지면 올리기")}
            </Button>
          )
        }
      />

      {list.status === "pending" ? (
        <ListSkeleton />
      ) : list.status === "error" ? (
        <ErrorState
          title={t("newspaper.loadFailed", "지면 목록을 불러오지 못했습니다")}
          description={t("error.description", "잠시 후 다시 시도해 주세요.")}
          retryLabel={t("error.retry", "다시 시도")}
          onRetry={list.retry}
        />
      ) : (
        <NewspaperTable
          newspapers={list.newspapers}
          onEdit={(target) => setEditing({ open: true, target })}
          onDelete={(target) => setDeleting({ open: true, target })}
        />
      )}

      <NewspaperFormDialog
        open={editing.open}
        onOpenChange={(open) => setEditing((e) => ({ ...e, open }))}
        target={editing.target}
        suggestedTitle={suggestNextTitle(list.newspapers)}
        progress={list.progress}
        onSave={save}
      />

      <AlertDialog
        open={deleting.open}
        onOpenChange={(open) =>
          !list.isDeleting && setDeleting((d) => ({ ...d, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("newspaper.delete.title", "{{title}} 지면을 삭제할까요?", {
                title: deleting.target?.title,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "newspaper.delete.description",
                "PDF 파일도 함께 지워지고 되돌릴 수 없습니다. 사이트의 지면 보기에서는 다음 배포 때 사라집니다.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={list.isDeleting}>
              {t("newspaper.form.cancel", "취소")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={list.isDeleting}
              onClick={() => void confirmDelete()}
            >
              {t("newspaper.table.delete", "삭제")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-24 mobile:hidden" />
          <Skeleton className="h-5 w-24 mobile:hidden" />
        </div>
      ))}
    </div>
  );
}
