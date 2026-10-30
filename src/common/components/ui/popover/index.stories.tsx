import { type Meta, type StoryObj } from "@storybook/react-vite";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/common/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from ".";

const meta = {
  title: "Common/Popover",
  component: Popover,
  render: () => (
    <div className="h-64">
      <Popover defaultOpen>
        <PopoverTrigger render={<Button variant="ghost" />}>
          학술·연구
          <ChevronDownIcon />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>학술·연구</PopoverTitle>
            <PopoverDescription>학술 행사와 연구 현장 소식</PopoverDescription>
          </PopoverHeader>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            nativeButton={false}
            render={<a href="#" />}
          >
            전체 보기
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
