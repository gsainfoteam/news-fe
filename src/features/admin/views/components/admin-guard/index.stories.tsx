import { type Meta, type StoryObj } from "@storybook/react-vite";
import { FileTextIcon } from "lucide-react";

import { EmptyState } from "@/common/components/ui/empty-state";
import {
  handleMe,
  handleMeError,
  handleNoSession,
  handleSessionError,
  mockUser,
} from "@/features/auth/models/mocks";

import { AdminGuard } from ".";
import { AdminPageHeader } from "../admin-layout";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });

// (EDITOR and up), so a reporter (NONE) sees the forbidden notice.
const meta = {
  title: "Admin/AdminGuard",
  component: AdminGuard,
  args: { section: "articles", children: null },
  render: (args) => (
    <AdminGuard section={args.section}>
      <AdminPageHeader title="기사" description="가드를 통과하면 보이는 내용" />
      <EmptyState icon={<FileTextIcon />} title="페이지 내용" />
    </AdminGuard>
  ),
  parameters: { layout: "fullscreen", ...msw(handleMe(mockUser())) },
} satisfies Meta<typeof AdminGuard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** EDITORSHIP: every menu, members included. */
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** EDITOR: articles and reports, no members menu. */
export const Editor: Story = {
  parameters: msw(handleMe(mockUser({ name: "이서연", permission: "EDITOR" }))),
};

/** NONE (a member): only reports, so the article page is forbidden. */
export const Reporter: Story = {
  parameters: msw(handleMe(mockUser({ name: "한지우", permission: "NONE" }))),
};

export const LoggedOut: Story = { parameters: msw(handleNoSession()) };

export const SessionError: Story = { parameters: msw(handleSessionError()) };

export const AccountError: Story = { parameters: msw(handleMeError()) };

/** Logged in but not on the member list. */
export const NotMember: Story = {
  parameters: msw(
    handleMe(
      mockUser({
        name: "독자",
        email: "reader@gm.gist.ac.kr",
        role: undefined,
        permission: "NONE",
      }),
    ),
  ),
};
