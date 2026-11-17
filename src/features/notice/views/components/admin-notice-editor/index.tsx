import { AdminArticleEditor } from "@/features/article";

export function AdminNoticeEditor({ mode }: AdminNoticeEditor.Props) {
  return <AdminArticleEditor mode={mode} kind="notice" />;
}

export namespace AdminNoticeEditor {
  export type Props = Omit<AdminArticleEditor.Props, "kind">;
}
