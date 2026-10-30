import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Label } from "@/common/components/ui/label";

import { Checkbox } from ".";

const meta = {
  title: "Common/Checkbox",
  component: Checkbox,
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Label className="font-normal">
        <Checkbox defaultChecked />
        학술·연구
      </Label>
      <Label className="font-normal">
        <Checkbox />
        연구
      </Label>
      <Label className="font-normal">
        <Checkbox disabled />
        비활성
      </Label>
      <Label className="font-normal">
        <Checkbox aria-invalid />
        필수 동의
      </Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
