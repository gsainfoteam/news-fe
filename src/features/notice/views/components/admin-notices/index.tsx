import { AdminGuard } from "@/features/admin";
import { AdminArticleList } from "@/features/article";

export function AdminNotices() {
  return (
    <AdminGuard section="notices">
      <AdminArticleList kind="notice" />
    </AdminGuard>
  );
}
