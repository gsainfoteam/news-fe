import { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ErrorState } from "@/common/components/ui/error-state";
import { Skeleton } from "@/common/components/ui/skeleton";
import { AdminGuard, AdminPageHeader } from "@/features/admin";
import { type User } from "@/features/auth";

import { type MemberInput } from "../../../models";
import { canRegisterMembers } from "../../../viewmodels/member-role";
import { useMembers } from "../../../viewmodels/use-members";
import { MemberPermissions } from "../member-permissions";
import { MemberRegisterForm } from "../member-register-form";
import { MemberTable } from "../member-table";

// The `/admin/members` island.
export function AdminMembers() {
  return (
    <AdminGuard section="members">
      {(user) => <MemberManagement viewer={user} />}
    </AdminGuard>
  );
}

export function MemberManagement({ viewer }: MemberManagement.Props) {
  const { t, i18n } = useTranslation();
  const list = useMembers(i18n.language);
  const emails = useMemo(
    () => list.members.map((m) => m.email),
    [list.members],
  );

  const register = async (members: MemberInput[]) => {
    try {
      await list.register(members);
    } catch (error) {
      toast.error(
        t("member.toast.registerFailed", "멤버를 등록하지 못했습니다"),
        {
          description: t(
            "member.toast.registerFailedDescription",
            "이미 등록된 이메일이 없는지 확인하고 다시 시도해 주세요.",
          ),
        },
      );
      throw error;
    }
    toast.success(
      t("member.toast.registered", "{{count}}명을 등록했습니다", {
        count: members.length,
      }),
    );
  };

  return (
    <>
      <AdminPageHeader
        title={t("member.title", "멤버 관리")}
        description={
          list.status === "success" &&
          t("member.count", "멤버 {{count}}명", { count: list.members.length })
        }
      />

      {list.status === "pending" ? (
        <ListSkeleton />
      ) : list.status === "error" ? (
        <ErrorState
          title={t("member.loadFailed", "멤버 목록을 불러오지 못했습니다")}
          description={t("error.description", "잠시 후 다시 시도해 주세요.")}
          retryLabel={t("error.retry", "다시 시도")}
          onRetry={list.retry}
        />
      ) : (
        <>
          {canRegisterMembers(viewer) && (
            <MemberRegisterForm existingEmails={emails} onRegister={register} />
          )}
          <MemberPermissions />
          <MemberTable
            members={list.members}
            viewer={viewer}
            onChangeRole={(member, role) => list.changeRole(member.id, role)}
            onDelete={(member) => list.deleteMember(member.id)}
            changingRole={list.isChangingRole}
            deleting={list.isDeleting}
          />
        </>
      )}
    </>
  );
}

export namespace MemberManagement {
  export type Props = { viewer: User };
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-24 mobile:hidden" />
          <Skeleton className="h-5 w-16 mobile:hidden" />
        </div>
      ))}
    </div>
  );
}
