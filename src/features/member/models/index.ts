import {
  type MemberDto,
  type RegisterMembersDto,
} from "@/@types/api/types.gen";
import { zMemberDto, zRegisterMembersDto } from "@/@types/api/zod.gen";

export { getMembers as fetchMembers } from "@/@types/api/sdk.gen";
export {
  getMembersOptions as membersQuery,
  getMembersQueryKey as membersQueryKey,
} from "@/@types/api/@tanstack/react-query.gen";

export type Member = MemberDto;

export {
  deleteMemberMutation,
  registerMembersMutation,
  updateMemberMutation,
} from "@/@types/api/@tanstack/react-query.gen";

export type MemberInput = RegisterMembersDto;
export const zMemberInput = zRegisterMembersDto;

// Ordered from the top of the masthead down, ALUMNI last; lists sort by it.
export const MEMBER_ROLES = zMemberDto.shape.role.options;
export type MemberRole = (typeof MEMBER_ROLES)[number];

// The backend refuses EDITOR_IN_CHIEF on registration; it is handed over with
// PATCH instead.
export const REGISTRABLE_ROLES = zRegisterMembersDto.shape.role.options;
export type RegistrableRole = (typeof REGISTRABLE_ROLES)[number];
