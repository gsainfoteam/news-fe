import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Button } from "@/common/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from ".";

const meta = {
  title: "Common/AlertDialog",
  component: AlertDialog,
  render: () => (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        기사 삭제
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이 기사를 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            ‘가을 축제 사흘간의 기록’을 삭제하면 되돌릴 수 없습니다.
            사이트에서는 1~2분 뒤 사라집니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction variant="destructive">삭제</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
