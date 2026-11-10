import { type MemberDto } from "@/@types/api/types.gen";

export { getMembers as fetchMembers } from "@/@types/api/sdk.gen";
export {
  getMembersOptions as membersQuery,
  getMembersQueryKey as membersQueryKey,
} from "@/@types/api/@tanstack/react-query.gen";

export type Member = MemberDto;
