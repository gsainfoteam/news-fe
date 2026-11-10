import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { membersQuery } from "@/features/member";

import { type Article, articleQuery } from "../models";
import { getAuthorOptions, parseArticleId } from "./article-editor";

/** The article named by `?id=` on `/admin/articles/edit`. */
export function useEditableArticle() {
  const [id] = useState(() => parseArticleId(window.location.search));
  const query = useQuery({
    // The CMS reading an article is not a reader view.
    ...articleQuery({ path: { id: id ?? 0 }, query: { increaseView: false } }),
    enabled: id !== undefined,
    retry: (count, error) => !isNotFound(error) && count < 2,
  });

  if (id === undefined || (query.isError && isNotFound(query.error))) {
    return { status: "not-found" as const };
  }
  if (query.isPending) return { status: "loading" as const };
  if (query.isError) {
    return {
      status: "error" as const,
      retry: () => void query.refetch(),
      retrying: query.isFetching,
    };
  }
  return { status: "ready" as const, article: query.data };
}

function isNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    error.statusCode === 404
  );
}

export function useAuthorOptions(authors?: Article["authors"]) {
  const query = useQuery(membersQuery());
  return {
    options: getAuthorOptions(query.data ?? [], authors),
    loading: query.isPending,
    error: query.isError,
    retry: () => void query.refetch(),
  };
}
