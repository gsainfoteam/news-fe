import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { mockUser } from "@/features/auth/models/mocks";
import { MOCK_MEMBERS } from "@/features/member/models/mocks";

import { MemberTable } from ".";
import { sortMembers } from "../../../viewmodels/member-role";

// The pencil opens the role select in place; picking 편집장 asks to confirm
// the handover before saving.
const meta = {
  title: "Member/MemberTable",
  component: MemberTable,
  args: {
    members: sortMembers(MOCK_MEMBERS),
    viewer: mockUser(),
    onChangeRole: fn(async () => {}),
    onDelete: fn(async () => {}),
  },
  render: (args) => (
    <div className="p-6 mobile:p-4">
      <MemberTable {...args} />
    </div>
  ),
} satisfies Meta<typeof MemberTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** EDITOR may read the list (news-be allows it) but changes nothing. */
export const ReadOnly: Story = {
  args: {
    viewer: mockUser({ email: "seoyeon@gm.gist.ac.kr", permission: "EDITOR" }),
  },
};
