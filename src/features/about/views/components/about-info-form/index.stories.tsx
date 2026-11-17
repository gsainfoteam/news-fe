import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { MOCK_ABOUT } from "@/features/about/models/mocks";

import { AboutInfoForm } from ".";
import { toAboutFormValues } from "../../../viewmodels/about-form";

const meta = {
  title: "About/AboutInfoForm",
  component: AboutInfoForm,
  args: {
    saved: toAboutFormValues(MOCK_ABOUT),
    onSave: fn(async () => {}),
  },
  render: (args) => (
    <div className="max-w-[960px]">
      <AboutInfoForm {...args} />
    </div>
  ),
} satisfies Meta<typeof AboutInfoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
