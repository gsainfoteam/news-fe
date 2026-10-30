import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Button } from "@/common/components/ui/button";

import { Header } from ".";
import { MobileMenu } from "../mobile-menu";

const meta = {
  title: "Common/Header",
  component: Header,
  parameters: { layout: "fullscreen" },
  args: { currentCategory: "RESEARCH" },
  // The login island fills `account` later; a stand-in shows its spot.
  render: (args) => (
    <div className="min-h-96">
      <Header
        {...args}
        account={
          <Button variant="outline" size="sm">
            로그인
          </Button>
        }
        menu={<MobileMenu currentCategory={args.currentCategory} />}
      />
    </div>
  ),
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
