import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ArticleListCard } from "./index";

const articles = [
  {
    category: "사회",
    title: "2025 APEC Among Engineers",
    author: "장도윤",
    publishedAt: "15시간 전",
    href: "#",
    thumbnailImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
  },
  {
    category: "대학",
    title: "학생들 '호실 부족' 우려... 대학생활관 현황과 대책은",
    author: "장도윤",
    publishedAt: "2026. 1. 26",
    href: "#",
    thumbnailImage:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&h=200&fit=crop",
  },
  {
    category: "오피니언",
    title: "대학의 공공성과 등록금: 우리는 무엇을 기대해야 하나",
    author: "지스트 신문사",
    publishedAt: "3시간 전",
    href: "#",
    thumbnailImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=200&fit=crop",
  },
];

const meta = {
  title: "Article/ArticleListCard",
  component: ArticleListCard,
  args: { articles, buttonLabel: "더 보기", buttonHref: "#" },
} satisfies Meta<typeof ArticleListCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: { title: "사회", orientation: "vertical" },
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
};
