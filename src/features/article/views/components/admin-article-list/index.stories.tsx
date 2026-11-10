import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  handleAdminArticles,
  handleAdminArticlesError,
  MOCK_ADMIN_ARTICLES,
} from "@/features/article/models/admin-mocks";
import { handleMe, mockUser } from "@/features/auth/models/mocks";

import { AdminArticles } from ".";

// Search, filters, paging and delete all run against the in-memory list.
const meta = {
  title: "Article/AdminArticleList",
  component: AdminArticles,
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        handleMe(mockUser()),
        ...handleAdminArticles(MOCK_ADMIN_ARTICLES),
      ],
    },
  },
} satisfies Meta<typeof AdminArticles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** The list request fails; the guard still passes. */
export const LoadError: Story = {
  parameters: {
    msw: { handlers: [handleMe(mockUser()), handleAdminArticlesError()] },
  },
};
