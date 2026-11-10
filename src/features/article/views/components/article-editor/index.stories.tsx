import { type Meta, type StoryObj } from "@storybook/react-vite";

import { AdminGuard } from "@/features/admin";
import {
  handleArticleImageUpload,
  handleArticleSave,
  handleCreateArticle,
  handleGetMembers,
  handleMockError,
  MOCK_EDIT_ARTICLE,
  MOCK_MEMBERS,
} from "@/features/article/models/editor-mocks";
import { handleMe, mockUser } from "@/features/auth/models/mocks";

import { AdminArticleEditor, ArticleEditor } from ".";

const handlers = [
  handleMe(mockUser()),
  handleGetMembers({ body: MOCK_MEMBERS }),
  ...handleArticleImageUpload(),
  ...handleArticleSave(),
];

// Images upload through the mocked S3 PUT (1.2s), and saving echoes back.
const meta = {
  title: "Article/ArticleEditor",
  component: AdminArticleEditor,
  args: { mode: "new" },
  parameters: { layout: "fullscreen", msw: { handlers } },
} satisfies Meta<typeof AdminArticleEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** An existing article, as `/admin/articles/edit?id=42` opens it. */
export const Edit: Story = {
  render: () => (
    <AdminGuard section="articles">
      <ArticleEditor article={MOCK_EDIT_ARTICLE} />
    </AdminGuard>
  ),
};

export const EditMobile: Story = {
  ...Edit,
  globals: { viewport: { value: "mobile" } },
};

/** Storybook's own `?id=` is not an article id, so this is the not-found state. */
export const EditNotFound: Story = { args: { mode: "edit" } };

/** Every image's S3 PUT fails: the placeholder goes and a toast explains. */
export const UploadFails: Story = {
  parameters: {
    msw: {
      handlers: [
        handleMe(mockUser()),
        handleGetMembers({ body: MOCK_MEMBERS }),
        ...handleArticleImageUpload({ putStatus: 500, delayMs: 400 }),
      ],
    },
  },
};

export const SaveFails: Story = {
  parameters: {
    msw: {
      handlers: [
        handleMe(mockUser()),
        handleGetMembers({ body: MOCK_MEMBERS }),
        ...handleArticleImageUpload(),
        handleMockError(handleCreateArticle),
      ],
    },
  },
};

export const MembersFail: Story = {
  parameters: {
    msw: {
      handlers: [handleMe(mockUser()), handleMockError(handleGetMembers)],
    },
  },
};
