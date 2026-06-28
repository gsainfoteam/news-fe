import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ArticleCard } from "./index";

const meta = {
  title: "Article/ArticleCard",
  component: ArticleCard,
  args: {
    category: "사회",
    title: "2025 APEC Among Engineers",
    author: "장도윤",
    publishedAt: "15시간 전",
    href: "#",
  },
} satisfies Meta<typeof ArticleCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    thumbnailImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
  },
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    mainImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
};
