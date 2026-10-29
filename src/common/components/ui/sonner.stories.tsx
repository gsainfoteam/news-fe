import { type Meta, type StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { Button } from "./button";
import { Toaster } from "./sonner";

const meta = {
  title: "Common/Sonner",
  component: Toaster,
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Toaster {...args} />
      <Button variant="outline" onClick={() => toast("저장했습니다.")}>
        기본
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("제보를 보냈습니다.")}
      >
        성공
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("업로드에 실패했습니다.")}
      >
        오류
      </Button>
    </div>
  ),
};
