import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from ".";

const rows = [
  ["공동 장비실 예약 시스템 바뀐다", "대학", "박지호", "2026.10.19", "433"],
  [
    "기숙사 식당 저녁 운영 시간 30분 늘어난다",
    "대학",
    "박지호",
    "2026.10.25",
    "1,032",
  ],
  [
    "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
    "학술·연구",
    "김도윤, 이서연",
    "2026.10.28",
    "1,204",
  ],
];

const meta = {
  title: "Common/Table",
  component: Table,
  render: () => (
    <Table>
      <TableCaption>기사 목록</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>제목</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>작성자</TableHead>
          <TableHead>발행일</TableHead>
          <TableHead className="text-right">조회수</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([title, category, authors, date, views]) => (
          <TableRow key={title}>
            <TableCell className="min-w-64 font-semibold">{title}</TableCell>
            <TableCell className="whitespace-nowrap">{category}</TableCell>
            <TableCell className="whitespace-nowrap">{authors}</TableCell>
            <TableCell className="whitespace-nowrap text-subtle-foreground tabular-nums">
              {date}
            </TableCell>
            <TableCell className="text-right tabular-nums">{views}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
