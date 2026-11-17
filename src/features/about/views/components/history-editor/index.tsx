import { useState } from "react";

import {
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";

import { type HistoryEntry, type HistoryInput } from "../../../models";
import {
  ABOUT_LIMITS,
  emptyHistory,
  type HistoryFormValues,
  toHistoryFormValues,
} from "../../../viewmodels/about-form";
import { formatDay, sortHistory } from "../../../viewmodels/about-page";
import { useHistoryForm } from "../../../viewmodels/use-about-form";
import { FormField } from "../about-info-form";

export function HistoryEditor({
  entries,
  onAdd,
  onUpdate,
  onDelete,
}: HistoryEditor.Props) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<number>();
  const [deleteTarget, setDeleteTarget] = useState<HistoryEntry>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const sorted = sortHistory(entries);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteOpen(false);
    } catch {
      // The caller reports the failure; the dialog stays for another try.
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section
      aria-labelledby="history-editor-title"
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border px-[18px] py-3.5">
        <h2 id="history-editor-title" className="text-[15px] font-extrabold">
          {t("about.history", "연혁")}
        </h2>
        <span className="text-2xs text-subtle-foreground tabular-nums">
          {t("about.admin.historyCount", "항목 {{count}}개", {
            count: entries.length,
          })}
        </span>
      </div>

      <div className="border-b border-border p-[18px] mobile:p-4">
        <HistoryForm
          idPrefix="history-new"
          initial={emptyHistory()}
          submitLabel={t("about.admin.addHistory", "연혁 추가")}
          submitIcon={<PlusIcon />}
          onSave={onAdd}
        />
      </div>

      {sorted.length === 0 ? (
        <p className="px-[18px] py-10 text-center text-sm text-subtle-foreground">
          {t("about.historyEmpty", "아직 등록된 연혁이 없습니다.")}
        </p>
      ) : (
        <ol>
          {sorted.map((entry) => (
            <li
              key={entry.id}
              className="border-b border-border px-[18px] py-3.5 last:border-b-0 mobile:px-4"
            >
              {editingId === entry.id ? (
                <HistoryForm
                  idPrefix={`history-${entry.id}`}
                  initial={toHistoryFormValues(entry)}
                  submitLabel={t("about.admin.save", "저장")}
                  onSave={async (input) => {
                    await onUpdate(entry.id, input);
                    setEditingId(undefined);
                  }}
                  onCancel={() => setEditingId(undefined)}
                />
              ) : (
                <div className="flex items-start gap-4 mobile:flex-col mobile:gap-2">
                  <time
                    dateTime={entry.date}
                    className="w-[96px] shrink-0 pt-px text-sm font-semibold text-brand-text tabular-nums"
                  >
                    {formatDay(entry.date)}
                  </time>
                  <p className="min-w-0 flex-1 text-sm whitespace-pre-line">
                    {entry.content}
                  </p>
                  <div className="-my-1 flex shrink-0 gap-1 mobile:self-end">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("about.admin.editEntry", "{{date}} 수정", {
                        date: formatDay(entry.date),
                      })}
                      title={t("about.admin.edit", "수정")}
                      onClick={() => setEditingId(entry.id)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="destructive-ghost"
                      size="icon-sm"
                      aria-label={t(
                        "about.admin.deleteEntry",
                        "{{date}} 삭제",
                        { date: formatDay(entry.date) },
                      )}
                      title={t("about.admin.delete", "삭제")}
                      onClick={() => {
                        setDeleteTarget(entry);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("about.admin.deleteTitle", "{{date}} 연혁을 삭제할까요?", {
                date: deleteTarget && formatDay(deleteTarget.date),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.content}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("about.admin.cancel", "취소")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting && <LoaderCircleIcon className="animate-spin" />}
              {t("about.admin.delete", "삭제")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export namespace HistoryEditor {
  export type Props = {
    entries: HistoryEntry[];
    /** Each rejects to keep the form or dialog open for another try. */
    onAdd: (entry: HistoryInput) => Promise<unknown>;
    onUpdate: (id: number, entry: HistoryInput) => Promise<unknown>;
    onDelete: (id: number) => Promise<unknown>;
  };
}

function HistoryForm({
  idPrefix,
  initial,
  submitLabel,
  submitIcon,
  onSave,
  onCancel,
}: {
  idPrefix: string;
  initial: HistoryFormValues;
  submitLabel: string;
  submitIcon?: React.ReactNode;
  onSave: (entry: HistoryInput) => Promise<unknown>;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const form = useHistoryForm({ initial, onSave });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="flex items-start gap-3 mobile:flex-col mobile:items-stretch"
    >
      <div className="grid min-w-0 flex-1 grid-cols-[168px_minmax(0,1fr)] gap-3 mobile:grid-cols-1">
        <form.Field name="date">
          {(field) => (
            <FormField
              field={field}
              id={`${idPrefix}-date`}
              label={t("about.admin.date", "날짜")}
            >
              {(control) => <Input {...control} type="date" />}
            </FormField>
          )}
        </form.Field>
        <form.Field name="content">
          {(field) => (
            <FormField
              field={field}
              id={`${idPrefix}-content`}
              label={t("about.admin.content", "내용")}
            >
              {(control) => (
                <Textarea
                  {...control}
                  rows={1}
                  maxLength={ABOUT_LIMITS.historyContent}
                  placeholder={t(
                    "about.admin.contentPlaceholder",
                    "예: 지스트신문 50호 발행",
                  )}
                  className="min-h-10 py-2"
                />
              )}
            </FormField>
          )}
        </form.Field>
      </div>
      <div className="mt-[27px] flex shrink-0 gap-2 mobile:mt-0 mobile:justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("about.admin.cancel", "취소")}
          </Button>
        )}
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(submitting) => (
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                submitIcon
              )}
              {submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
