import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from ".";

const meta = {
  title: "Common/Pagination",
  component: Pagination,
  render: () => (
    <Pagination aria-label="페이지">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" aria-label="이전 페이지" aria-disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">12</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" aria-label="다음 페이지" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
