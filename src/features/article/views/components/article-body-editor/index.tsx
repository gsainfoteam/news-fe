import {
  createContext,
  type SubmitEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  type Editor,
  EditorContent,
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ImagePlusIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { cn } from "@/common/lib/cn";

import {
  ARTICLE_IMAGE_ACCEPT,
  checkArticleImage,
} from "../../../viewmodels/article-editor";
import { type UploadProgressStore } from "../../../viewmodels/use-article-images";

export function ArticleBodyEditor({
  initialContent,
  onLoad,
  onChange,
  upload,
  progress,
  invalid,
  describedBy,
}: ArticleBodyEditor.Props) {
  const { t } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);
  // ProseMirror keeps the first editorProps it gets, so drop and paste read
  // the latest insert function through this ref.
  const insertRef = useRef<(files: File[], at?: number) => void>(() => {});
  const bodyLabel = t("admin.editor.body", "본문");
  const attributes = useMemo(
    () => ({
      class: PROSE_CLASS,
      role: "textbox",
      "aria-multiline": "true",
      "aria-label": bodyLabel,
      "aria-invalid": invalid ? "true" : "false",
      ...(describedBy && { "aria-describedby": describedBy }),
    }),
    [bodyLabel, invalid, describedBy],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Only what the toolbar offers, so shortcuts can't add markup the
        // reader page has no style for.
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        horizontalRule: false,
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      ArticleImage,
      Placeholder.configure({
        placeholder: t("admin.editor.bodyPlaceholder", "본문을 입력하세요"),
      }),
    ],
    content: initialContent,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes,
      handleDrop: (view, event, _slice, moved) => {
        const files = [...(event.dataTransfer?.files ?? [])];
        if (moved || files.length === 0) return false;
        event.preventDefault();
        const at = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos;
        insertRef.current(files, at);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = [...(event.clipboardData?.files ?? [])];
        if (files.length === 0) return false;
        event.preventDefault();
        insertRef.current(files);
        return true;
      },
    },
    onCreate: ({ editor }) => onLoad(editor.getHTML()),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // useEditor reads its options once; a validation error arrives later.
  useEffect(() => {
    editor.setOptions({
      editorProps: { ...editor.options.editorProps, attributes },
    });
  }, [editor, attributes]);

  insertRef.current = (files, at) => {
    for (const file of files) {
      const issue = checkArticleImage(file);
      if (issue) {
        toast.error(
          t("admin.editor.image.rejected", "올릴 수 없는 파일입니다"),
          {
            description:
              issue === "type"
                ? t(
                    "admin.editor.image.type",
                    "{{name}}: jpg, png, webp, gif 파일만 올릴 수 있습니다.",
                    { name: file.name },
                  )
                : t("admin.editor.image.empty", "{{name}}: 빈 파일입니다.", {
                    name: file.name,
                  }),
          },
        );
        continue;
      }
      const { id, done } = upload(file);
      const preview = URL.createObjectURL(file);
      const { from, to } = editor.state.selection;
      editor
        .chain()
        // Undo must not bring back a placeholder whose upload is gone.
        .setMeta("addToHistory", false)
        .insertContentAt(at ?? { from, to }, {
          type: "image",
          attrs: { src: preview, alt: "", uploadId: id },
        })
        .run();
      done
        .then(
          ({ url }) => updateUpload(editor, id, { src: url, uploadId: null }),
          () => {
            updateUpload(editor, id, null);
            toast.error(
              t("admin.editor.image.failed", "이미지를 올리지 못했습니다"),
              {
                description: t(
                  "admin.editor.image.failedDescription",
                  "{{name}}: 잠시 뒤 다시 넣어 주세요.",
                  { name: file.name },
                ),
              },
            );
          },
        )
        .finally(() => URL.revokeObjectURL(preview));
    }
  };

  return (
    <UploadProgressContext value={progress}>
      <Toolbar editor={editor} onPickImage={() => fileInput.current?.click()} />
      <input
        ref={fileInput}
        type="file"
        accept={ARTICLE_IMAGE_ACCEPT}
        multiple
        hidden
        onChange={(event) => {
          insertRef.current([...(event.target.files ?? [])]);
          event.target.value = "";
        }}
      />
      <EditorContent
        editor={editor}
        className="px-10 pt-7 pb-12 mobile:px-4 mobile:pt-5 mobile:pb-8"
      />
    </UploadProgressContext>
  );
}

export namespace ArticleBodyEditor {
  export type Props = {
    initialContent: string;
    /** Tiptap's normalized HTML of `initialContent`, once loaded. */
    onLoad: (html: string) => void;
    onChange: (html: string) => void;
    upload: (file: File) => {
      id: string;
      done: Promise<{ url: string; key: string }>;
    };
    progress: UploadProgressStore;
    invalid?: boolean;
    describedBy?: string;
  };
}

// Mirrors the reader's article body (design `.prose`) so the editor shows
// what gets published.
const PROSE_CLASS = cn(
  "min-h-80 text-[18px] leading-[1.85] tracking-[-0.005em] text-foreground outline-none mobile:min-h-60 mobile:text-[17px] mobile:leading-[1.8]",
  "[&_p]:mb-[1.35em] [&>p:first-child]:text-[21px] [&>p:first-child]:leading-[1.7] [&>p:first-child]:font-medium mobile:[&>p:first-child]:text-[19px]",
  "[&_h2]:mt-[2em] [&_h2]:mb-[0.8em] [&_h2]:text-[23px] [&_h2]:leading-[1.4] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] mobile:[&_h2]:text-[20px]",
  "[&_h3]:mt-[1.6em] [&_h3]:mb-[0.6em] [&_h3]:text-[19px] [&_h3]:leading-[1.45] [&_h3]:font-bold mobile:[&_h3]:text-[17px]",
  "[&_blockquote]:my-[2.2em] [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:py-1 [&_blockquote]:pl-6 [&_blockquote]:text-[26px] [&_blockquote]:leading-[1.5] [&_blockquote]:font-bold [&_blockquote]:tracking-[-0.025em] [&_blockquote_p]:mb-0 mobile:[&_blockquote]:text-[20px]",
  "[&_ul]:mb-[1.35em] [&_ul]:list-disc [&_ul]:pl-[1.3em] [&_ol]:mb-[1.35em] [&_ol]:list-decimal [&_ol]:pl-[1.3em] [&_li_p]:mb-[0.4em]",
  "[&_a]:text-brand-text [&_a]:underline [&_a]:underline-offset-3",
  "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:font-normal [&_.is-editor-empty:first-child]:before:text-subtle-foreground [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
);

const UploadProgressContext = createContext<UploadProgressStore>({
  subscribe: () => () => {},
  get: () => undefined,
  count: () => 0,
});

// `uploadId` marks a placeholder whose file is still uploading. It is never
// written to the HTML, so a saved body only has finished images.
const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uploadId: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

/** Points a placeholder at its uploaded file, or removes it (`null`). */
function updateUpload(
  editor: Editor,
  uploadId: string,
  attrs: { src: string; uploadId: null } | null,
) {
  if (editor.isDestroyed) return;
  const { state, view } = editor;
  state.doc.descendants((node, pos) => {
    if (node.type.name !== "image" || node.attrs.uploadId !== uploadId) {
      return true;
    }
    const tr = attrs
      ? state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs })
      : state.tr.delete(pos, pos + node.nodeSize);
    view.dispatch(tr.setMeta("addToHistory", false));
    return false;
  });
}

function ImageNodeView({ node, selected }: NodeViewProps) {
  const { t } = useTranslation();
  const progress = useContext(UploadProgressContext);
  const uploadId = node.attrs.uploadId as string | null;
  const ratio = useSyncExternalStore(progress.subscribe, () =>
    uploadId ? progress.get(uploadId) : undefined,
  );
  const percent = Math.round((ratio ?? 0) * 100);

  return (
    <NodeViewWrapper className="relative my-8" data-drag-handle="">
      <img
        src={node.attrs.src as string}
        alt={(node.attrs.alt as string | null) ?? ""}
        draggable={false}
        className={cn(
          "block h-auto w-full rounded-sm bg-placeholder",
          selected && "outline-2 outline-offset-3 outline-ring",
        )}
      />
      {uploadId && (
        <div
          role="status"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 rounded-sm bg-background/70 text-sm font-semibold"
        >
          <span>
            {t(
              "admin.editor.image.uploading",
              "이미지 올리는 중… {{percent}}%",
              {
                percent,
              },
            )}
          </span>
          <span className="h-1 w-50 max-w-[70%] overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </span>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function Toolbar({
  editor,
  onPickImage,
}: {
  editor: Editor;
  onPickImage: () => void;
}) {
  const { t } = useTranslation();
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      blockquote: editor.isActive("blockquote"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label={t("admin.editor.toolbar", "서식")}
      className="sticky top-0 z-10 scrollbar-none flex flex-wrap items-center gap-0.5 border-y border-border bg-card px-8 py-1.5 mobile:flex-nowrap mobile:overflow-x-auto mobile:px-2"
    >
      <ToolbarButton
        label={t("admin.editor.undo", "실행 취소")}
        disabled={!state.canUndo}
        onClick={() => chain().undo().run()}
      >
        <Undo2Icon />
      </ToolbarButton>
      <ToolbarButton
        label={t("admin.editor.redo", "다시 실행")}
        disabled={!state.canRedo}
        onClick={() => chain().redo().run()}
      >
        <Redo2Icon />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton
        label={t("admin.editor.heading2", "소제목")}
        pressed={state.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label={t("admin.editor.heading3", "작은 소제목")}
        pressed={state.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton
        label={t("admin.editor.bold", "굵게")}
        pressed={state.bold}
        onClick={() => chain().toggleBold().run()}
      >
        <BoldIcon strokeWidth={2.6} />
      </ToolbarButton>
      <ToolbarButton
        label={t("admin.editor.italic", "기울임")}
        pressed={state.italic}
        onClick={() => chain().toggleItalic().run()}
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton
        label={t("admin.editor.quote", "인용")}
        pressed={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      >
        <QuoteIcon />
      </ToolbarButton>
      <ToolbarButton
        label={t("admin.editor.bulletList", "글머리 목록")}
        pressed={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      >
        <ListIcon />
      </ToolbarButton>
      <ToolbarButton
        label={t("admin.editor.orderedList", "번호 목록")}
        pressed={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrderedIcon />
      </ToolbarButton>
      <ToolbarSeparator />
      <LinkButton editor={editor} active={state.link} />
      <ToolbarButton
        label={t("admin.editor.image.insert", "이미지 넣기")}
        onClick={onPickImage}
      >
        <ImagePlusIcon />
      </ToolbarButton>
    </div>
  );
}

const TOOLBAR_BUTTON_CLASS =
  "inline-flex size-[34px] shrink-0 items-center justify-center rounded-md text-[13px] font-extrabold text-muted-foreground transition-colors outline-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 aria-pressed:bg-muted aria-pressed:text-foreground [&_svg]:size-4";

function ToolbarButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={TOOLBAR_BUTTON_CLASS}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return (
    <span aria-hidden="true" className="mx-1.5 h-5 w-px shrink-0 bg-border" />
  );
}

function LinkButton({ editor, active }: { editor: Editor; active: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");
  const label = t("admin.editor.link", "링크");

  const apply = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = href.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!value) {
      chain.unsetLink().run();
    } else {
      const url = /^[a-z][a-z0-9+.-]*:/i.test(value)
        ? value
        : `https://${value}`;
      if (editor.state.selection.empty && !active) {
        chain
          .insertContent({
            type: "text",
            text: value,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .run();
      } else {
        chain.setLink({ href: url }).run();
      }
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref((editor.getAttributes("link").href as string) ?? "");
        setOpen(next);
      }}
    >
      <PopoverTrigger
        aria-label={label}
        title={label}
        aria-pressed={active}
        className={TOOLBAR_BUTTON_CLASS}
      >
        <LinkIcon />
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]">
        <form onSubmit={apply} className="flex flex-col gap-3">
          <Input
            type="text"
            inputMode="url"
            autoFocus
            aria-label={t("admin.editor.linkUrl", "링크 주소")}
            placeholder="https://"
            value={href}
            onChange={(event) => setHref(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            {active && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .unsetLink()
                    .run();
                  setOpen(false);
                }}
              >
                {t("admin.editor.unlink", "링크 빼기")}
              </Button>
            )}
            <Button type="submit" size="sm">
              {t("admin.editor.applyLink", "적용")}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
