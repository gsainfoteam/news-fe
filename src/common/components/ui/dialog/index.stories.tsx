import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Button } from "@/common/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from ".";

const meta = {
  title: "Common/Dialog",
  component: Dialog,
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger render={<Button variant="outline" />}>
        닉네임 변경
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>닉네임을 바꿀까요?</DialogTitle>
          <DialogDescription>
            바꾼 닉네임은 지금까지 쓴 댓글에도 함께 표시됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
