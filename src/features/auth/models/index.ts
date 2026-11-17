import { type UserDto } from "@/@types/api/types.gen";
import { zUserDto } from "@/@types/api/zod.gen";

export * from "./account";

export { getMeOptions as meQuery } from "@/@types/api/@tanstack/react-query.gen";
export { getMe as fetchMe, updateNickname } from "@/@types/api/sdk.gen";

export type User = UserDto;

// Ordered from least to most access; permission checks compare positions.
export const PERMISSIONS = zUserDto.shape.permission.options;
export type Permission = (typeof PERMISSIONS)[number];

export const MEMBER_ROLES = zUserDto.shape.role.unwrap().options;
export type MemberRole = (typeof MEMBER_ROLES)[number];
