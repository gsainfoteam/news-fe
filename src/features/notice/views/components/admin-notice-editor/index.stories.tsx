import { type Meta, type StoryObj } from "@storybook/react-vite";

import { AdminGuard } from "@/features/admin";
import { ArticleEditor } from "@/features/article";
import {
  handleArticleImageUpload,
  handleArticleSave,
  handleGetMembers,
  MOCK_MEMBERS,
} from "@/features/article/models/editor-mocks";
import { handleMe, mockUser } from "@/features/auth/models/mocks";
import { createMockNotice } from "@/features/notice/models/mocks";

import { AdminNoticeEditor } from ".";

const notice = createMockNotice(0);

const meta = {
  title: "Notice/AdminNoticeEditor",
  component: AdminNoticeEditor,
  args: { mode: "new" },
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        handleMe(mockUser()),
        handleGetMembers({ body: MOCK_MEMBERS }),
        ...handleArticleImageUpload(),
        ...handleArticleSave(notice),
      ],
    },
  },
} satisfies Meta<typeof AdminNoticeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** An existing notice, as `/admin/notices/edit?id=900` opens it. */
export const Edit: Story = {
  render: () => (
    <AdminGuard section="notices">
      <ArticleEditor article={notice} kind="notice" />
    </AdminGuard>
  ),
};
