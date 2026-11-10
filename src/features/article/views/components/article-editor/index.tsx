import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";

import {
  ArrowLeftIcon,
  ClockIcon,
  FileQuestionIcon,
  Loader2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/common/components/ui/button";
import { EmptyState } from "@/common/components/ui/empty-state";
import { ErrorState } from "@/common/components/ui/error-state";
import { FieldError } from "@/common/components/ui/field";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/common/lib/cn";
import { localizePath } from "@/common/lib/languages";
import { AdminGuard } from "@/features/admin";

import { type Article } from "../../../models";
import { type ArticleDraft } from "../../../viewmodels/article-editor";
import { useArticleEditor } from "../../../viewmodels/use-article-editor";
import {
  useAuthorOptions,
  useEditableArticle,
} from "../../../viewmodels/use-editable-article";
import { ArticleBodyEditor } from "../article-body-editor";
import { AuthorPicker } from "../author-picker";
import { CategoryPicker } from "../category-picker";

// The `/admin/articles/new` and `/admin/articles/edit?id=` island.
export function AdminArticleEditor({ mode }: AdminArticleEditor.Props) {
  return (
    <AdminGuard section="articles">
      {mode === "edit" ? <EditArticle /> : <ArticleEditor />}
    </AdminGuard>
  );
}

export namespace AdminArticleEditor {
  export type Props = { mode: "new" | "edit" };
}

function EditArticle() {
  const { t, i18n } = useTranslation();
  const result = useEditableArticle();

  switch (result.status) {
    case "loading":
      return <EditorSkeleton />;
    case "not-found":
      return (
        <EmptyState
          icon={<FileQuestionIcon />}
          title={t("admin.editor.notFound.title", "기사를 찾을 수 없습니다")}
          description={t(
            "admin.editor.notFound.description",
            "삭제되었거나 주소가 잘못되었습니다.",
          )}
          className="py-16"
        >
          <a
            href={localizePath(i18n.language, "/admin")}
            className={buttonVariants({ variant: "outline" })}
          >
            {t("admin.editor.backToList", "기사 목록")}
          </a>
        </EmptyState>
      );
    case "error":
      return (
        <ErrorState
          title={t("admin.editor.loadError", "기사를 불러오지 못했습니다")}
          description={t("error.description", "잠시 후 다시 시도해 주세요.")}
          retryLabel={t("error.retry", "다시 시도")}
          onRetry={result.retry}
          retrying={result.retrying}
        />
      );
    case "ready":
      return <ArticleEditor key={result.article.id} article={result.article} />;
  }
}

export function ArticleEditor({ article }: ArticleEditor.Props) {
  const { t, i18n } = useTranslation();
  const editor = useArticleEditor(article);
  const authors = useAuthorOptions(article?.authors);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const ids = {
    titleError: useId(),
    contentError: useId(),
    authors: useId(),
    authorsError: useId(),
  };

  const isNew = !editor.article;
  const listHref = localizePath(i18n.language, "/admin");
  const { draft, errors, change } = editor;

  const save = async () => {
    const result = await editor.save();
    switch (result.status) {
      case "invalid": {
        toast.error(
          t("admin.editor.invalid", "입력하지 않은 항목이 있습니다"),
          {
            description: Object.values(result.errors).join(" "),
          },
        );
        focusFirstError(result.errors);
        return;
      }
      case "uploading":
        toast(t("admin.editor.uploadingTitle", "이미지를 올리는 중입니다"), {
          description: t(
            "admin.editor.uploadingDescription",
            "다 올라간 뒤 다시 눌러 주세요.",
          ),
        });
        return;
      case "failed":
        toast.error(t("admin.editor.saveFailed", "저장하지 못했습니다"), {
          description: t(
            "admin.editor.saveFailedDescription",
            "잠시 뒤 다시 시도해 주세요. 쓴 내용은 그대로 남아 있습니다.",
          ),
        });
        return;
      case "saved":
        if (result.created) {
          // Further saves edit the article just created instead of adding
          // another, and a reload opens it.
          history.replaceState(
            history.state,
            "",
            localizePath(
              i18n.language,
              `/admin/articles/edit?id=${result.article.id}`,
            ),
          );
        }
        toast.success(
          result.created
            ? t("admin.editor.published", "기사를 발행했습니다")
            : t("admin.editor.saved", "변경 사항을 저장했습니다"),
          {
            description: t(
              "admin.editor.rebuildNotice",
              "사이트에는 1~2분 뒤 반영됩니다.",
            ),
          },
        );
    }
  };

  const focusFirstError = (
    found: Partial<Record<keyof ArticleDraft, string>>,
  ) => {
    if (found.title) titleRef.current?.focus();
    else if (found.content) {
      paperRef.current
        ?.querySelector<HTMLElement>("[contenteditable]")
        ?.focus();
    } else if (found.authorIds) {
      document.getElementById(ids.authors)?.focus();
    }
  };

  const saveLabel = isNew
    ? t("admin.editor.publish", "발행하기")
    : t("admin.editor.save", "저장하기");
  const saveButton = (className?: string) => (
    <Button
      type="button"
      onClick={save}
      disabled={editor.saving}
      className={className}
    >
      {editor.saving && <Loader2Icon className="animate-spin" />}
      {saveLabel}
    </Button>
  );
  const rebuildHelp = (
    <p className="flex gap-1.5 text-xs text-subtle-foreground">
      <ClockIcon aria-hidden="true" className="mt-px size-3.5 shrink-0" />
      {isNew
        ? t(
            "admin.editor.publishHelp",
            "발행 후 사이트에 반영되기까지 1~2분 걸립니다.",
          )
        : t(
            "admin.editor.saveHelp",
            "저장 후 사이트에 반영되기까지 1~2분 걸립니다.",
          )}
    </p>
  );
  const status = editor.uploading
    ? t("admin.editor.uploadingCount", "이미지 {{count}}개를 올리는 중입니다", {
        count: editor.uploading,
      })
    : editor.dirty
      ? t("admin.editor.unsaved", "저장하지 않은 변경 사항이 있습니다")
      : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <a
            href={listHref}
            className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-subtle-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            {t("admin.editor.backToList", "기사 목록")}
          </a>
          <h1 className="text-[26px] leading-[1.3] font-extrabold tracking-[-0.025em] mobile:text-[22px]">
            {isNew
              ? t("admin.editor.newTitle", "새 기사")
              : t("admin.editor.editTitle", "기사 수정")}
          </h1>
        </div>
        <div className="flex gap-2 mobile:hidden">
          <a href={listHref} className={buttonVariants({ variant: "ghost" })}>
            {t("admin.editor.cancel", "취소")}
          </a>
          {saveButton()}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-8 mobile:grid-cols-1 mobile:gap-5">
        <div ref={paperRef} className="rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-1.5 px-10 pt-7 pb-2 mobile:px-4 mobile:pt-5 mobile:pb-1">
            <textarea
              ref={titleRef}
              rows={1}
              value={draft.title}
              onChange={(event) => change("title", event.target.value)}
              onKeyDown={preventNewline}
              aria-label={t("admin.editor.title", "제목")}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? ids.titleError : undefined}
              placeholder={t("admin.editor.title", "제목")}
              className="field-sizing-content w-full resize-none bg-transparent text-[32px] leading-[1.3] font-bold tracking-[-0.02em] text-foreground outline-none placeholder:text-subtle-foreground mobile:text-[24px]"
            />
            {errors.title && (
              <FieldError id={ids.titleError}>{errors.title}</FieldError>
            )}
            <textarea
              rows={1}
              value={draft.subtitle}
              onChange={(event) => change("subtitle", event.target.value)}
              onKeyDown={preventNewline}
              aria-label={t("admin.editor.subtitle", "부제목 (선택)")}
              placeholder={t("admin.editor.subtitle", "부제목 (선택)")}
              className="field-sizing-content w-full resize-none bg-transparent text-[19px] font-medium text-muted-foreground outline-none placeholder:text-subtle-foreground mobile:text-base"
            />
          </div>
          <ArticleBodyEditor
            initialContent={article?.content ?? ""}
            onLoad={editor.loadContent}
            onChange={(html) => change("content", html)}
            upload={editor.images.start}
            progress={editor.images.progress}
            invalid={!!errors.content}
            describedBy={errors.content ? ids.contentError : undefined}
          />
          {errors.content && (
            <FieldError
              id={ids.contentError}
              className="-mt-6 px-10 pb-6 mobile:-mt-4 mobile:px-4"
            >
              {errors.content}
            </FieldError>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Panel
            label={t("admin.editor.publishPanel", "발행")}
            className="mobile:hidden"
          >
            {saveButton("w-full")}
            {rebuildHelp}
            {status && (
              <p
                role="status"
                className="text-xs font-semibold text-muted-foreground"
              >
                {status}
              </p>
            )}
          </Panel>

          <Panel
            label={t("admin.editor.authors", "작성자")}
            labelFor={ids.authors}
            required
            meta={t("admin.editor.authorsMeta", "1명 이상")}
          >
            <AuthorPicker
              id={ids.authors}
              options={authors.options}
              value={draft.authorIds}
              onChange={(value) => change("authorIds", value)}
              loading={authors.loading}
              invalid={!!errors.authorIds}
            />
            {errors.authorIds && (
              <FieldError id={ids.authorsError}>{errors.authorIds}</FieldError>
            )}
            {authors.error && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-destructive-text">
                {t(
                  "admin.editor.membersError",
                  "멤버 목록을 불러오지 못했습니다.",
                )}
                <Button variant="outline" size="sm" onClick={authors.retry}>
                  {t("error.retry", "다시 시도")}
                </Button>
              </div>
            )}
          </Panel>

          <Panel
            label={t("admin.editor.categories", "카테고리")}
            meta={t("admin.editor.categoriesMeta", "{{count}}개 선택", {
              count: draft.categories.length,
            })}
          >
            <CategoryPicker
              value={draft.categories}
              onChange={(value) => change("categories", value)}
            />
          </Panel>

          <Panel label={t("admin.editor.images", "이미지")}>
            <p className="text-xs text-subtle-foreground">
              {t(
                "admin.editor.imagesHelp",
                "jpg, png, webp, gif 파일만 올릴 수 있습니다. 툴바의 이미지 버튼을 누르거나 본문에 끌어다 놓으세요. 본문의 첫 이미지가 목록 썸네일과 링크 미리보기 이미지로 쓰입니다.",
              )}
            </p>
          </Panel>

          <div className="hidden flex-col gap-2.5 mobile:flex">
            {status && (
              <p
                role="status"
                className="text-xs font-semibold text-muted-foreground"
              >
                {status}
              </p>
            )}
            {saveButton("w-full")}
            {rebuildHelp}
          </div>
        </div>
      </div>
    </>
  );
}

export namespace ArticleEditor {
  export type Props = {
    /** The article to edit; omit to write a new one. */
    article?: Article;
  };
}

function preventNewline(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
    event.preventDefault();
  }
}

function Panel({
  label,
  labelFor,
  required,
  meta,
  className,
  children,
}: {
  label: string;
  labelFor?: string;
  required?: boolean;
  meta?: string;
  className?: string;
  children: ReactNode;
}) {
  const Label = labelFor ? "label" : "h2";
  return (
    <section
      aria-label={label}
      className={cn("rounded-lg border border-border bg-card", className)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-[18px] py-3.5">
        <Label htmlFor={labelFor} className="text-[15px] font-extrabold">
          {label}
          {required && (
            <span aria-hidden="true" className="text-brand-text">
              {" *"}
            </span>
          )}
        </Label>
        {meta && (
          <span className="text-2xs text-subtle-foreground">{meta}</span>
        )}
      </div>
      <div className="flex flex-col gap-4 p-[18px]">{children}</div>
    </section>
  );
}

function EditorSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-8 mobile:grid-cols-1">
        <Skeleton className="h-[560px] rounded-lg" />
        <div className="flex flex-col gap-4 mobile:hidden">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
