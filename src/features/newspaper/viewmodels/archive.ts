import { dayjs } from "@/common/lib/dayjs";

import { type Newspaper } from "../models";

// The build runs in UTC; a paper registered on 1 January KST belongs to the
// new year.
const TIME_ZONE = "Asia/Seoul";

export type ArchiveIssue = Pick<Newspaper, "id" | "title" | "url"> & {
  /** When it was registered; news-be has no publication date. */
  date: Date;
};

export type ArchiveYear = { year: number; issues: ArchiveIssue[] };

export function toArchiveYears(papers: readonly Newspaper[]): ArchiveYear[] {
  const years = new Map<number, ArchiveIssue[]>();
  const latestFirst = papers.toSorted(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  for (const { id, title, url, createdAt } of latestFirst) {
    const year = dayjs(createdAt).tz(TIME_ZONE).year();
    const issues = years.get(year) ?? [];
    issues.push({ id, title, url, date: createdAt });
    years.set(year, issues);
  }
  return [...years].map(([year, issues]) => ({ year, issues }));
}

const ISSUE_NUMBER = /제\s*(\d+)\s*호/;

export function getIssueNumber(title: string) {
  const match = ISSUE_NUMBER.exec(title);
  return match ? Number(match[1]) : undefined;
}

// Titles follow "제N호", so the upload form can fill in the next one.
export function suggestNextTitle(papers: readonly Pick<Newspaper, "title">[]) {
  const numbers = papers
    .map((paper) => getIssueNumber(paper.title))
    .filter((n) => n !== undefined);
  return numbers.length > 0 ? `제${Math.max(...numbers) + 1}호` : "";
}
