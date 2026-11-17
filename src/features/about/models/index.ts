import {
  type AboutDto,
  type CreateHistoryDto,
  type HistoryDto,
  type UpdateAboutDto,
} from "@/@types/api/types.gen";
import { zCreateHistoryDto, zUpdateAboutDto } from "@/@types/api/zod.gen";

export { getAbout as fetchAbout } from "@/@types/api/sdk.gen";
export {
  createHistoryMutation,
  deleteHistoryMutation,
  getAboutOptions as aboutQuery,
  getAboutQueryKey as aboutQueryKey,
  updateAboutMutation,
  updateHistoryMutation,
} from "@/@types/api/@tanstack/react-query.gen";

export type About = AboutDto;
export type HistoryEntry = HistoryDto;

export type AboutInput = UpdateAboutDto;
export const zAboutInput = zUpdateAboutDto;

export type HistoryInput = CreateHistoryDto;
export const zHistoryInput = zCreateHistoryDto;
