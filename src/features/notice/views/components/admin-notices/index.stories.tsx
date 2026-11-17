import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  handleAdminArticles,
  MOCK_ADMIN_ARTICLES,
} from "@/features/article/models/admin-mocks";
import { handleMe, mockUser } from "@/features/auth/models/mocks";
import { MOCK_NOTICES } from "@/features/notice/models/mocks";

import { AdminNotices } from ".";

// Articles are in the mocked list too: the screen asks for NOTICE only.
const meta = {
  title: "Notice/AdminNotices",
  component: AdminNotices,
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        handleMe(mockUser()),
        ...handleAdminArticles([...MOCK_NOTICES, ...MOCK_ADMIN_ARTICLES]),
      ],
    },
  },
} satisfies Meta<typeof AdminNotices>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
