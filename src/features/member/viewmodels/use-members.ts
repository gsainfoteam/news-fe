import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { meQuery } from "@/features/auth";

import { isHandover, sortMembers } from "./member-role";
import {
  deleteMemberMutation,
  type Member,
  type MemberInput,
  type MemberRole,
  membersQuery,
  membersQueryKey,
  registerMembersMutation,
  updateMemberMutation,
} from "../models";

const NO_MEMBERS: Member[] = [];

export function useMembers(lng?: string) {
  const queryClient = useQueryClient();
  const query = useQuery(membersQuery());
  // A stable array keeps the duplicate-email schema built on it memoized.
  const members = useMemo(
    () => (query.data ? sortMembers(query.data, lng) : NO_MEMBERS),
    [query.data, lng],
  );
  const refetchList = () =>
    queryClient.invalidateQueries({ queryKey: membersQueryKey() });

  const register = useMutation({
    ...registerMembersMutation(),
    onSuccess: refetchList,
  });
  const update = useMutation(updateMemberMutation());
  const remove = useMutation({
    ...deleteMemberMutation(),
    onSuccess: refetchList,
  });

  const changeRole = async (id: string, role: MemberRole) => {
    await update.mutateAsync({ path: { id }, body: { role } });
    // A handover demotes the viewer, so the guard has to see the new role and
    // close this page; refetching the list first would only hit a 403.
    await (isHandover(role)
      ? queryClient.invalidateQueries({ queryKey: meQuery().queryKey })
      : refetchList());
  };

  return {
    members,
    status: query.status,
    retry: () => void query.refetch(),
    register: (members: MemberInput[]) =>
      register.mutateAsync({ body: members }),
    changeRole,
    isChangingRole: update.isPending,
    deleteMember: (id: string) => remove.mutateAsync({ path: { id } }),
    isDeleting: remove.isPending,
  };
}
