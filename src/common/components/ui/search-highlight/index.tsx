import { cn } from "@/common/lib/cn";

export function splitByQuery(text: string, query: string) {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (terms.length === 0) return [{ text, match: false }];

  // A capturing group keeps the matches in `split`'s output at odd indexes.
  return text
    .split(new RegExp(`(${terms.join("|")})`, "gi"))
    .map((part, i) => ({ text: part, match: i % 2 === 1 }))
    .filter((part) => part.text !== "");
}

export function SearchHighlight({
  text,
  query,
  className,
}: SearchHighlight.Props) {
  return splitByQuery(text, query).map((part, i) =>
    part.match ? (
      <mark
        key={i}
        className={cn("rounded-[2px] bg-mark px-0.5 text-inherit", className)}
      >
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
}

export namespace SearchHighlight {
  export type Props = {
    text: string;
    query: string;
    className?: string;
  };
}
