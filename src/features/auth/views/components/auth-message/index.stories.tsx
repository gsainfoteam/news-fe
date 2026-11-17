import { type Meta, type StoryObj } from "@storybook/react-vite";
import { LockKeyholeIcon } from "lucide-react";

import { Button } from "@/common/components/ui/button";

import { AuthMessage } from ".";

const meta = {
  title: "Auth/AuthMessage",
  component: AuthMessage,
  args: {
    icon: <LockKeyholeIcon />,
    title: "로그인이 필요합니다",
    description: "인포팀 계정으로 로그인하면 이 페이지를 볼 수 있습니다.",
  },
  render: (args) => (
    <div className="py-16">
      <AuthMessage {...args}>
        <Button>로그인</Button>
        <Button variant="outline">홈으로 가기</Button>
      </AuthMessage>
    </div>
  ),
} satisfies Meta<typeof AuthMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
