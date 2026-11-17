import { type Meta, type StoryObj } from "@storybook/react-vite";

import { MOCK_ABOUT } from "@/features/about/models/mocks";

import { AboutPage } from ".";
import { toAboutPage } from "../../../viewmodels/about-page";

const meta = {
  title: "About/AboutPage",
  component: AboutPage,
  parameters: { layout: "fullscreen" },
  args: { about: toAboutPage(MOCK_ABOUT) },
  render: (args) => (
    <div className="page-container">
      <AboutPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AboutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
