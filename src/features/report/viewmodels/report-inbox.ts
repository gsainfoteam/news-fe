import { parsePhoneNumberFromString } from "libphonenumber-js/min";

import { localizePath } from "@/common/lib/languages";

import { REPORT_FILE_LINK_TTL_MS } from "../models";

// `GET /report` takes up to 50.
export const REPORTS_PAGE_SIZE = 20;

// Reporters' names and contacts shouldn't outlive the screen in memory, but
// paging back and forth within a minute shouldn't refetch either.
export const REPORT_GC_TIME_MS = 30_000;

// The URL is signed when the response is built, so measuring from when the
// response arrived (client clock) avoids clock skew with the server. The
// margin covers request latency and a slow download start.
const LINK_SAFETY_MARGIN_MS = 60_000;
export const REPORT_FILE_LINK_LIFETIME_MS =
  REPORT_FILE_LINK_TTL_MS - LINK_SAFETY_MARGIN_MS;

export function getFileLinkExpiresAt(fetchedAt: number) {
  return fetchedAt + REPORT_FILE_LINK_LIFETIME_MS;
}

export function isFileLinkExpired(fetchedAt: number, now: number) {
  return now >= getFileLinkExpiresAt(fetchedAt);
}

export type InboxLocation = {
  id?: number;
  page: number;
};

const positiveInt = (value: string | null) => {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
};

// `/admin/reports?page=` is the list and `/admin/reports/view?id=&page=` a
// report over the list. Static pages can't have `[id]` routes, so the id is a
// query parameter.
export function parseInboxLocation(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  const isView = /\/admin\/reports\/view\/?$/.test(pathname);
  return {
    id: isView ? positiveInt(params.get("id")) : undefined,
    page: positiveInt(params.get("page")) ?? 1,
  } satisfies InboxLocation;
}

export function getInboxHref(lng: string, { id, page }: InboxLocation) {
  const params = new URLSearchParams();
  if (id !== undefined) params.set("id", String(id));
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  const path = id === undefined ? "/admin/reports" : "/admin/reports/view";
  return localizePath(lng, query ? `${path}?${query}` : path);
}

export function toReportsQuery(page: number) {
  return {
    offset: (page - 1) * REPORTS_PAGE_SIZE,
    limit: REPORTS_PAGE_SIZE,
  };
}

export function getPageCount(count: number) {
  return Math.max(1, Math.ceil(count / REPORTS_PAGE_SIZE));
}

// Up to `size` consecutive pages around the current one.
export function getPageWindow(page: number, pageCount: number, size = 5) {
  const start = Math.max(
    1,
    Math.min(page - Math.floor(size / 2), pageCount - size + 1),
  );
  const end = Math.min(pageCount, start + size - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// The generated query functions throw the parsed `ErrorDto` body.
export function getErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return undefined;
  const status = (error as { statusCode?: unknown }).statusCode;
  return typeof status === "number" ? status : undefined;
}

// A 4xx answer (missing report, lost session) won't change on retry.
export function shouldRetryReport(failureCount: number, error: unknown) {
  const status = getErrorStatus(error);
  if (status !== undefined && status < 500) return false;
  return failureCount < 2;
}

// The form validates with `@IsPhoneNumber('KR')`, so stored numbers come in
// any format the reporter typed ("01012345678", "+82 10-1234-5678").
export function formatReporterPhone(phone: string) {
  const parsed = parsePhoneNumberFromString(phone, "KR");
  if (!parsed?.isValid()) {
    return { label: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` };
  }
  return {
    label:
      parsed.country === "KR"
        ? parsed.formatNational()
        : parsed.formatInternational(),
    href: parsed.getURI(),
  };
}

export function getReplyHref(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

// The backend allows an empty or missing title; the list needs some line.
export function getReportTitle(title: string | null | undefined) {
  const trimmed = title?.trim();
  return trimmed ? trimmed : undefined;
}

export function toExcerpt(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
