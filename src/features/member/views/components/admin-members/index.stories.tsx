import { type Meta, type StoryObj } from "@storybook/react-vite";

import { handleMe, mockUser } from "@/features/auth/models/mocks";
import {
  handleMembers,
  handleMembersError,
  MOCK_MEMBERS,
} from "@/features/member/models/mocks";

import { AdminMembers } from ".";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });

// Register, change a role and delete run against an in-memory list that
// follows news-be's rules. `/user/me` stays fixed, so after a handover the
// page keeps the editor-in-chief's view.
const meta = {
  title: "Member/AdminMembers",
  component: AdminMembers,
  parameters: {
    layout: "fullscreen",
    ...msw(handleMe(mockUser()), ...handleMembers(MOCK_MEMBERS)),
  },
} satisfies Meta<typeof AdminMembers>;

export default meta;
type Story = StoryObj<typeof meta>;

/** EDITORSHIP (the editor-in-chief): everything but their own row. */
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** EDITOR: the guard blocks the page and the menu has no members entry. */
export const Editor: Story = {
  parameters: msw(
    handleMe(
      mockUser({
        name: "이서연",
        email: "seoyeon@gm.gist.ac.kr",
        permission: "EDITOR",
      }),
    ),
    ...handleMembers(MOCK_MEMBERS),
  ),
};

/** The list request fails; the guard still passes. */
export const LoadError: Story = {
  parameters: msw(handleMe(mockUser()), handleMembersError()),
};
