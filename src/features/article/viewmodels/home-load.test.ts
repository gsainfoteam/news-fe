import { afterAll, beforeAll, expect, test } from "bun:test";
import { setupServer } from "msw/node";

import { fetchHomeArticles, HOME_SECTION_SIZE } from "./home";
import { handleAdminArticles, mockArticle } from "../models/admin-mocks";

// First in both sorts, so the first page of either is all notices.
const notices = Array.from({ length: 60 }, (_, i) =>
  mockArticle({ categories: ["NOTICE"], views: 1000 - i }),
);
const articles = Array.from({ length: 10 }, (_, i) =>
  mockArticle({ categories: ["CAMPUS"], views: 10 - i }),
);

const server = setupServer(...handleAdminArticles([...notices, ...articles]));
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

test("pages past notices so the latest and popular lists still fill", async () => {
  const { latest, popular } = await fetchHomeArticles();
  const ids = articles.map((a) => a.id);
  expect(latest.map((a) => a.id)).toEqual(ids);
  expect(popular.map((a) => a.id)).toEqual(
    ids.slice(0, HOME_SECTION_SIZE.popular + 1),
  );
});
