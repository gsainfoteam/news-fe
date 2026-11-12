import { type Meta, type StoryObj } from "@storybook/react-vite";

import { MemberPermissions } from ".";

const meta = {
  title: "Member/MemberPermissions",
  component: MemberPermissions,
  render: () => (
    <div className="p-6 mobile:p-4">
      <MemberPermissions />
    </div>
  ),
} satisfies Meta<typeof MemberPermissions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
