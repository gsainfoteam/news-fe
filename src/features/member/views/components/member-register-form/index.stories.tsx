import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { MOCK_MEMBERS } from "@/features/member/models/mocks";

import { MemberRegisterForm } from ".";

// Try an email from the list (doyun@gm.gist.ac.kr) or the same email twice.
const meta = {
  title: "Member/MemberRegisterForm",
  component: MemberRegisterForm,
  args: {
    existingEmails: MOCK_MEMBERS.map((m) => m.email),
    onRegister: fn(async () => {}),
  },
  render: (args) => (
    <div className="p-6 mobile:p-4">
      <MemberRegisterForm {...args} />
    </div>
  ),
} satisfies Meta<typeof MemberRegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
