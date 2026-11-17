import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  handleMockImages,
  MOCK_IMAGE_BUCKET,
} from "@/features/article/models/editor-mocks";

import { ThumbnailPicker } from ".";

const image = (name: string) => `${MOCK_IMAGE_BUCKET}/articles/${name}`;

const OPTIONS: ThumbnailPicker.Props["options"] = [
  { src: image("wordpress/featured.jpg"), inBody: false },
  { src: image("2026-10-28/lab-cabinet.png"), inBody: true },
  { src: image("2026-10-28/safety-board.png"), inBody: true },
  { src: image("2026-10-28/interview.png"), inBody: true },
];

function Showcase() {
  const [value, setValue] = useState<string | null>(OPTIONS[2].src);
  return (
    <div className="flex w-80 max-w-full flex-col gap-8">
      <ThumbnailPicker options={OPTIONS} value={value} onChange={setValue} />
      <ThumbnailPicker options={[]} value={null} onChange={() => {}} />
    </div>
  );
}

const meta = {
  title: "Article/ThumbnailPicker",
  component: ThumbnailPicker,
  args: { options: [], value: null, onChange: () => {} },
  parameters: { msw: { handlers: [handleMockImages()] } },
  render: () => <Showcase />,
} satisfies Meta<typeof ThumbnailPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
