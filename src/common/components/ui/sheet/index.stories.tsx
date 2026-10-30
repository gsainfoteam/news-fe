import { type Meta, type StoryObj } from "@storybook/react-vite";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/common/components/ui/button";

import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from ".";

const categories = [
  "대학",
  "사회",
  "학술·연구",
  "문화",
  "기획·특집",
  "오피니언",
];

const meta = {
  title: "Common/Sheet",
  component: Sheet,
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="메뉴 열기" />}
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>지스트신문</SheetTitle>
          <SheetClose
            render={
              <Button variant="ghost" size="icon" aria-label="메뉴 닫기" />
            }
          >
            <XIcon />
          </SheetClose>
        </SheetHeader>
        <SheetBody>
          <ul className="flex flex-col">
            {categories.map((name) => (
              <li
                key={name}
                className="flex h-11 items-center justify-between font-bold"
              >
                {name}
                <ChevronDownIcon className="size-4 text-subtle-foreground" />
              </li>
            ))}
          </ul>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" className="flex-1">
            제보하기
          </Button>
          <Button className="flex-1">로그인</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
