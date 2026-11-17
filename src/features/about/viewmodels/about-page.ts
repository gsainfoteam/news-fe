import { type About, fetchAbout, type HistoryEntry } from "../models";

export type HistoryYear = { year: string; entries: HistoryEntry[] };

export type AboutPageData = Omit<About, "histories" | "introduction"> & {
  paragraphs: string[];
  timeline: HistoryYear[];
};

let about: Promise<About> | undefined;

// Build only. `/about` and `/en/about` share one request.
export function loadAbout(): Promise<About> {
  about ??= fetchAbout({ throwOnError: true })
    .then(({ data }) => data)
    .catch((error: unknown) => {
      about = undefined;
      throw error;
    });
  return about;
}

export function toAboutPage({
  introduction,
  histories,
  ...facts
}: About): AboutPageData {
  return {
    ...facts,
    paragraphs: toParagraphs(introduction),
    timeline: groupHistoryByYear(histories),
  };
}

// The CMS edits the introduction in a plain textarea, so line breaks are the
// only structure it has.
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// news-be already sorts by date, then id; sorting again keeps the timeline
// right if that order ever changes.
export function sortHistory(histories: readonly HistoryEntry[]) {
  return [...histories].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id - b.id,
  );
}

export function groupHistoryByYear(
  histories: readonly HistoryEntry[],
): HistoryYear[] {
  const years: HistoryYear[] = [];
  for (const entry of sortHistory(histories)) {
    const year = entry.date.slice(0, 4);
    const last = years.at(-1);
    if (last?.year === year) last.entries.push(entry);
    else years.push({ year, entries: [entry] });
  }
  return years;
}

// Dates are calendar days ("2016-04-11"), not instants: reformatting the
// string avoids a Date, which would shift the day in time zones ahead of
// UTC+9 or behind UTC.
export function formatDay(date: string) {
  return date.replaceAll("-", ".");
}

export function formatMonthDay(date: string) {
  return formatDay(date.slice(5));
}

// Only http(s) links are rendered; anything else stays plain text.
export function toSafeUrl(url: string): string | undefined {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : undefined;
  } catch {
    return undefined;
  }
}

export function toLinkLabel(url: string) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

export function toInstagramHandle(url: string) {
  const handle = toLinkLabel(url).split("/")[1];
  return handle ? `@${handle}` : toLinkLabel(url);
}
