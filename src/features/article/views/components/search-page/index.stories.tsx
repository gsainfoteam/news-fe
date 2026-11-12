import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  handleSearchArticles,
  handleSearchArticlesError,
  handleSearchArticlesLoading,
} from "@/features/article/models/search-mocks";

import { SearchPage } from ".";

// The page reads its query from the URL. Put the story's own query on the
// preview iframe's URL (Storybook's `id` and `viewMode` stay) and take it off
// afterwards.
function withUrl(query: Record<string, string>) {
  return () => {
    const original = window.location.href;
    const url = new URL(original);
    for (const key of ["q", "category", "sort", "page"]) {
      url.searchParams.delete(key);
    }
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
    history.replaceState(history.state, "", url);
    return () => history.replaceState(history.state, "", original);
  };
}

const meta = {
  title: "Article/SearchPage",
  component: SearchPage,
  parameters: {
    layout: "padded",
    msw: { handlers: [handleSearchArticles()] },
  },
  beforeEach: withUrl({ q: "기숙사" }),
  render: () => (
    <div className="mx-auto w-full max-w-[904px] pt-10 pb-24 mobile:pt-6">
      <SearchPage />
    </div>
  ),
} satisfies Meta<typeof SearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 23 results: query marked in the cards, "더 보기" loads the next ten. */
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** No match: the empty state, then the latest articles. */
export const NoResults: Story = {
  beforeEach: withUrl({ q: "셔틀버스 노선표" }),
};

/** A category filter with no match keeps the bar to widen the search. */
export const NoResultsInCategory: Story = {
  beforeEach: withUrl({ q: "기숙사", category: "CULTURE" }),
};

/** `/search` with no query, e.g. from the header's mobile search icon. */
export const EmptyQuery: Story = { beforeEach: withUrl({}) };

/** Back from an article after "더 보기" twice: all three pages return. */
export const RestoredPages: Story = {
  beforeEach: withUrl({ q: "기숙사", sort: "MOST_POPULAR", page: "3" }),
};

export const Loading: Story = {
  parameters: { msw: { handlers: [handleSearchArticlesLoading()] } },
};

export const LoadError: Story = {
  parameters: { msw: { handlers: [handleSearchArticlesError()] } },
};
