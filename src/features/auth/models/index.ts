import { type LoginDto, type UserDto } from "@/@types/api/types.gen";
import { zLoginDto, zUpdateNicknameDto, zUserDto } from "@/@types/api/zod.gen";

export * from "./account";
export * from "./login-return";

export {
  getMeOptions as meQuery,
  updateNicknameMutation,
} from "@/@types/api/@tanstack/react-query.gen";
export { getMe as fetchMe, updateNickname } from "@/@types/api/sdk.gen";
export { type UpdateNicknameDto as NicknameInput } from "@/@types/api/types.gen";

export type User = UserDto;

export const zSignupInput = zLoginDto.pick({ nickname: true });
export type SignupInput = Pick<LoginDto, "nickname">;

export const zNicknameInput = zUpdateNicknameDto;

// Ordered from least to most access; permission checks compare positions.
export const PERMISSIONS = zUserDto.shape.permission.options;
export type Permission = (typeof PERMISSIONS)[number];

export const MEMBER_ROLES = zUserDto.shape.role.unwrap().options;
export type MemberRole = (typeof MEMBER_ROLES)[number];
