import { type MemberDto } from "@/@types/api/types.gen";

// NEF-20 needs only the member list (to pick article authors). Member
// management (NEF-22) adds the rest of `/member` beside these.
export { getMembers as fetchMembers } from "@/@types/api/sdk.gen";
export {
  getMembersOptions as membersQuery,
  getMembersQueryKey as membersQueryKey,
} from "@/@types/api/@tanstack/react-query.gen";

export type Member = MemberDto;
