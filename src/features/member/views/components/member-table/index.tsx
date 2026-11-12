import { useState } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowRightIcon,
  EllipsisIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  DataTable,
  type dataTableFeatures,
} from "@/common/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/common/components/ui/native-select";
import { useDayjs } from "@/common/lib/dayjs";
import { getRoleLabels, type User } from "@/features/auth";

import { type Member, MEMBER_ROLES, type MemberRole } from "../../../models";
import {
  getAccessLabels,
  getAccessLevel,
  getMemberActions,
  isHandover,
  isSelf,
} from "../../../viewmodels/member-role";
import { AccessBadge } from "../access-badge";

const col = createColumnHelper<typeof dataTableFeatures, Member>();

type Editing = { member: Member; role: MemberRole };

export function MemberTable({
  members,
  viewer,
  onChangeRole,
  onDelete,
  changingRole = false,
  deleting = false,
}: MemberTable.Props) {
  const { t } = useTranslation();
  const dayjs = useDayjs();
  const roleLabels = getRoleLabels(t);
  const accessLabels = getAccessLabels(t);
  const [editing, setEditing] = useState<Editing>();
  const [handover, setHandover] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member>();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const labels = {
    changeRole: t("member.table.changeRole", "직책 바꾸기"),
    delete: t("member.table.delete", "삭제"),
    cancel: t("member.table.cancel", "취소"),
    save: t("member.table.save", "저장"),
  };

  const startEditing = (member: Member) =>
    setEditing({ member, role: member.role });

  const save = async () => {
    if (!editing) return;
    if (editing.role === editing.member.role) return setEditing(undefined);
    if (isHandover(editing.role) && !handover) return setHandover(true);
    try {
      await onChangeRole(editing.member, editing.role);
      toast.success(
        isHandover(editing.role)
          ? t(
              "member.toast.handedOver",
              "편집장을 {{name}} 님에게 넘겼습니다",
              {
                name: editing.member.name,
              },
            )
          : t("member.toast.roleChanged", "{{name}} 님의 직책을 바꿨습니다", {
              name: editing.member.name,
            }),
      );
      setEditing(undefined);
    } catch {
      toast.error(t("member.toast.roleFailed", "직책을 바꾸지 못했습니다"), {
        description: t("error.description", "잠시 후 다시 시도해 주세요."),
      });
    } finally {
      setHandover(false);
    }
  };

  const askDelete = (member: Member) => {
    setDeleteTarget(member);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget);
      setDeleteOpen(false);
      toast.success(
        t("member.toast.deleted", "{{name}} 님을 삭제했습니다", {
          name: deleteTarget.name,
        }),
      );
    } catch {
      toast.error(
        t("member.toast.deleteFailed", "멤버를 삭제하지 못했습니다"),
        {
          description: t("error.description", "잠시 후 다시 시도해 주세요."),
        },
      );
    }
  };

  const isEditing = (m: Member) => editing?.member.id === m.id;

  const identity = (m: Member) => (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar aria-hidden="true">
        {m.picture && <AvatarImage src={m.picture} alt="" />}
        <AvatarFallback>{m.name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 font-bold">
          {m.name}
          {isSelf(viewer, m) && (
            <Badge className="h-[18px] px-1.5 text-[11px]">
              {t("member.table.me", "나")}
            </Badge>
          )}
        </span>
        <span className="truncate text-2xs text-subtle-foreground">
          {m.email}
        </span>
      </span>
    </span>
  );

  const roleSelect = (m: Member) => (
    <NativeSelect
      aria-label={t("member.table.roleOf", "{{name}} 님의 직책", {
        name: m.name,
      })}
      value={editing?.role}
      autoFocus
      onChange={(e) =>
        setEditing({ member: m, role: e.target.value as MemberRole })
      }
      onKeyDown={(e) => {
        if (e.key === "Escape") setEditing(undefined);
      }}
      className="w-[220px] mobile:w-full [&_select]:h-9 [&_select]:text-sm"
    >
      {MEMBER_ROLES.map((role) => (
        <NativeSelectOption key={role} value={role}>
          {roleLabels[role]}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );

  const access = (m: Member) => {
    const current = getAccessLevel(m);
    const next =
      isEditing(m) && editing
        ? getAccessLevel({ role: editing.role })
        : current;
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <AccessBadge level={current} label={accessLabels[current]} />
        {next !== current && (
          <>
            <ArrowRightIcon
              aria-hidden="true"
              className="size-3.5 text-subtle-foreground"
            />
            <span className="sr-only">
              {t("member.table.accessAfter", "저장하면 권한이 바뀝니다:")}
            </span>
            <AccessBadge level={next} label={accessLabels[next]} />
          </>
        )}
      </span>
    );
  };

  const editButtons = (
    <span className="flex justify-end gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        disabled={changingRole}
        onClick={() => setEditing(undefined)}
      >
        {labels.cancel}
      </Button>
      <Button size="sm" disabled={changingRole} onClick={() => void save()}>
        {labels.save}
      </Button>
    </span>
  );

  const columns = col.columns([
    col.display({
      id: "member",
      header: t("member.table.member", "멤버"),
      cell: ({ row }) => identity(row.original),
    }),
    col.accessor("role", {
      header: t("member.table.role", "직책"),
      meta: { className: "whitespace-nowrap" },
      cell: ({ row: { original: m } }) =>
        isEditing(m) ? roleSelect(m) : roleLabels[m.role],
    }),
    col.accessor("permission", {
      header: t("member.table.access", "권한"),
      cell: ({ row }) => access(row.original),
    }),
    col.accessor("createdAt", {
      header: t("member.table.createdAt", "등록일"),
      meta: {
        className: "whitespace-nowrap text-muted-foreground tabular-nums",
      },
      cell: ({ getValue }) => dayjs(getValue()).format("YYYY.MM.DD"),
    }),
    col.display({
      id: "actions",
      header: () => (
        <span className="sr-only">{t("member.table.actions", "작업")}</span>
      ),
      cell: ({ row: { original: m } }) => {
        if (isEditing(m)) return editButtons;
        const actions = getMemberActions(viewer, m);
        return (
          <span className="flex justify-end gap-1">
            {actions.canChangeRole && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${m.name} ${labels.changeRole}`}
                title={labels.changeRole}
                onClick={() => startEditing(m)}
              >
                <PencilIcon />
              </Button>
            )}
            {actions.canDelete && (
              <Button
                variant="destructive-ghost"
                size="icon-sm"
                aria-label={`${m.name} ${labels.delete}`}
                title={labels.delete}
                onClick={() => askDelete(m)}
              >
                <Trash2Icon />
              </Button>
            )}
          </span>
        );
      },
    }),
  ]);

  return (
    <>
      <DataTable
        caption={t("member.table.caption", "멤버 목록")}
        columns={columns}
        data={members}
        getRowId={(m) => m.id}
        empty={t("member.table.empty", "등록된 멤버가 없습니다")}
        rowClassName={({ original: m }) =>
          isEditing(m)
            ? "bg-surface hover:bg-surface"
            : m.role === "ALUMNI"
              ? "text-subtle-foreground"
              : undefined
        }
        renderMobileItem={({ original: m }) => {
          const actions = getMemberActions(viewer, m);
          return (
            <>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">{identity(m)}</div>
                {!isEditing(m) &&
                  (actions.canChangeRole || actions.canDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                        aria-label={t(
                          "member.table.menu",
                          "{{name}} 작업 메뉴",
                          { name: m.name },
                        )}
                      >
                        <EllipsisIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {actions.canChangeRole && (
                          <DropdownMenuItem onClick={() => startEditing(m)}>
                            <PencilIcon />
                            {labels.changeRole}
                          </DropdownMenuItem>
                        )}
                        {actions.canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => askDelete(m)}
                            >
                              <Trash2Icon />
                              {labels.delete}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
              {isEditing(m) ? (
                <div className="flex flex-col gap-2.5">
                  {roleSelect(m)}
                  <div className="flex items-center justify-between gap-2">
                    {access(m)}
                    {editButtons}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {roleLabels[m.role]}
                  </span>
                  {access(m)}
                </div>
              )}
            </>
          );
        }}
      />

      <AlertDialog
        open={handover}
        onOpenChange={(open) => !changingRole && setHandover(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                "member.handover.title",
                "{{name}} 님에게 편집장을 넘길까요?",
                {
                  name: editing?.member.name,
                },
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "member.handover.description",
                "넘기면 내 직책은 수습기자가 되고, 멤버 관리와 기사 편집 권한을 잃습니다. 되돌리려면 새 편집장이 다시 넘겨줘야 합니다.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={changingRole}>
              {labels.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={changingRole}
              onClick={() => void save()}
            >
              {t("member.handover.action", "편집장 넘기기")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => !deleting && setDeleteOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("member.delete.title", "{{name}} 님을 삭제할까요?", {
                name: deleteTarget?.name,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "member.delete.description",
                "목록에서 사라지고 CMS를 쓸 수 없게 됩니다. 쓴 기사의 작성자 이름은 남습니다. 나간 부원을 목록에 남기려면 삭제하지 말고 직책을 ‘거쳐간 사람’으로 바꾸세요.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {labels.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {labels.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export namespace MemberTable {
  export type Props = {
    /** Already sorted; see `sortMembers`. */
    members: Member[];
    viewer: Pick<User, "email" | "permission">;
    onChangeRole: (member: Member, role: MemberRole) => Promise<unknown>;
    onDelete: (member: Member) => Promise<unknown>;
    changingRole?: boolean;
    deleting?: boolean;
  };
}
