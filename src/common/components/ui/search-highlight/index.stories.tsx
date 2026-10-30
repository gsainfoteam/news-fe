import { type Meta, type StoryObj } from "@storybook/react-vite";

import { SearchHighlight } from ".";

const meta = {
  title: "Common/SearchHighlight",
  component: SearchHighlight,
  args: {
    text: "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
    query: "안전 현장",
  },
  render: (args) => (
    <div className="flex max-w-xl flex-col gap-2">
      <p className="text-h3">
        <SearchHighlight {...args} />
      </p>
      <p className="text-sm text-muted-foreground">
        <SearchHighlight
          text="학기마다 바뀌는 안전 점검표가 현장에 어떻게 적용되는지 살펴봤다."
          query={args.query}
        />
      </p>
    </div>
  ),
} satisfies Meta<typeof SearchHighlight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
