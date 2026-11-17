import { type Meta, type StoryObj } from "@storybook/react-vite";

import { AccountMenu } from "@/features/auth";
import { handleMe, mockUser } from "@/features/auth/models/mocks";

import { Header } from ".";
import { MobileMenu } from "../mobile-menu";

const meta = {
  title: "Common/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [handleMe(mockUser())] },
  },
  args: { currentCategory: "RESEARCH" },
  render: (args) => (
    <div className="min-h-96">
      <Header
        {...args}
        account={<AccountMenu />}
        menu={<MobileMenu currentCategory={args.currentCategory} />}
      />
    </div>
  ),
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
