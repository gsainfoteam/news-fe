import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/common/components/ui/skeleton";

import { ErrorState } from ".";

const meta = {
  title: "Common/ErrorState",
  component: ErrorState,
  args: {
    title: "내용을 불러오지 못했습니다",
    retryLabel: "다시 시도",
    onRetry: () => {},
  },
  render: () => (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-bold">TanStack Query와 함께</h3>
        <p className="text-xs text-muted-foreground">
          처음 요청은 실패하고, 다시 시도하면 1초 뒤 성공합니다.
        </p>
        <QueryExample />
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-bold">다시 시도하는 중</h3>
        <p className="text-xs text-muted-foreground">
          retrying이 참이면 버튼이 잠기고 아이콘이 돕니다.
        </p>
        <ErrorState
          title="내용을 불러오지 못했습니다"
          description="잠시 후 다시 시도해 주세요."
          retryLabel="다시 시도"
          onRetry={() => {}}
          retrying
        />
      </section>
    </div>
  ),
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

// An island would wrap itself in `QueryProvider` (shared client). The story
// makes its own client so each render starts from a failed first request.
function QueryExample() {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [fetchArticles] = useState(() => createFlakyFetch());
  return (
    <QueryClientProvider client={client}>
      <ArticleList fetchArticles={fetchArticles} />
    </QueryClientProvider>
  );
}

function ArticleList({
  fetchArticles,
}: {
  fetchArticles: () => Promise<string[]>;
}) {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["story", "articles"],
    queryFn: fetchArticles,
  });

  if (query.isPending) return <Skeleton className="h-48" />;
  if (query.isError) {
    return (
      <ErrorState
        title={t("error.title", "내용을 불러오지 못했습니다")}
        description={t("error.description", "잠시 후 다시 시도해 주세요.")}
        retryLabel={t("error.retry", "다시 시도")}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border px-4">
      {query.data.map((title) => (
        <li key={title} className="py-3 text-sm">
          {title}
        </li>
      ))}
    </ul>
  );
}

function createFlakyFetch() {
  let calls = 0;
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    calls += 1;
    if (calls === 1) throw new Error("503 Service Unavailable");
    return [
      "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
      "2학기 수강 정정 기간 하루 연장된다",
      "가을 축제 사흘간의 기록",
    ];
  };
}
