import { useEffect } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { Button } from "@/common/components/ui/button";

import { Toaster } from ".";

function Showcase() {
  useEffect(() => {
    const id = toast.success("링크를 복사했습니다", { duration: Infinity });
    return () => {
      toast.dismiss(id);
    };
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      <Toaster position="top-center" />
      <Button variant="outline" onClick={() => toast("저장했습니다")}>
        기본
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("제보를 보냈습니다")}
      >
        성공
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.info("사이트에 반영되기까지 1~2분 걸립니다")}
      >
        안내
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning("저장하지 않은 변경 사항이 있습니다")}
      >
        주의
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("업로드에 실패했습니다")}
      >
        오류
      </Button>
    </div>
  );
}

const meta = {
  title: "Common/Sonner",
  component: Toaster,
  render: () => <Showcase />,
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
