import { getNewspapers } from "@/@types/api/sdk.gen";
import { type NewspaperDto } from "@/@types/api/types.gen";
import {
  zCreateNewspaperDto,
  zCreateNewspaperFileUrlDto,
} from "@/@types/api/zod.gen";

export { getNewspaperFileUploadUrl as requestNewspaperUpload } from "@/@types/api/sdk.gen";
export {
  createNewspaperMutation,
  deleteNewspaperMutation,
  updateNewspaperMutation,
} from "@/@types/api/@tanstack/react-query.gen";
export {
  type CreateNewspaperDto as NewspaperInput,
  type NewspaperUploadUrlDto as NewspaperUpload,
  type UpdateNewspaperDto as NewspaperUpdate,
} from "@/@types/api/types.gen";
export { zCreateNewspaperFileUrlDto as zNewspaperFileRequest } from "@/@types/api/zod.gen";
export { putPresignedFile as putNewspaperFile } from "@/common/lib/presigned-upload";

export type Newspaper = NewspaperDto;

export const MAX_NEWSPAPER_FILE_SIZE =
  zCreateNewspaperFileUrlDto.shape.contentLength.maxValue ?? 100 * 1024 * 1024;
export const NEWSPAPER_TITLE_MAX =
  zCreateNewspaperDto.shape.title.maxLength ?? 200;

// The backend rejects a larger `limit` (class-validator @Max(50)).
const NEWSPAPER_FETCH_LIMIT = 50;

// A paper comes out every couple of months, so even the CMS loads the whole
// archive at once instead of paging it.
export async function fetchAllNewspapers({
  signal,
}: { signal?: AbortSignal } = {}): Promise<Newspaper[]> {
  const byId = new Map<number, Newspaper>();
  for (let offset = 0; ; offset += NEWSPAPER_FETCH_LIMIT) {
    const { data } = await getNewspapers({
      query: { offset, limit: NEWSPAPER_FETCH_LIMIT },
      signal,
      throwOnError: true,
    });
    // A paper registered mid-walk shifts offsets by one; the map drops the
    // duplicate that shift brings back.
    for (const paper of data.newspapers) byId.set(paper.id, paper);
    if (
      data.newspapers.length < NEWSPAPER_FETCH_LIMIT ||
      offset + NEWSPAPER_FETCH_LIMIT >= data.count
    ) {
      break;
    }
  }
  return [...byId.values()];
}

export const allNewspapersQueryKey = () => ["newspapers", "all"] as const;

export const allNewspapersQuery = () => ({
  queryKey: allNewspapersQueryKey(),
  queryFn: ({ signal }: { signal: AbortSignal }) =>
    fetchAllNewspapers({ signal }),
});
