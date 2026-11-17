import { type Meta, type StoryObj } from "@storybook/react-vite";

import { NewspaperArchive } from ".";
import { MOCK_NEWSPAPERS } from "../../../models/mocks";
import { toArchiveYears } from "../../../viewmodels/archive";

const meta = {
  title: "Newspaper/NewspaperArchive",
  component: NewspaperArchive,
  parameters: { layout: "fullscreen" },
  args: { years: toArchiveYears(MOCK_NEWSPAPERS) },
  render: (args) => (
    <div className="page-container">
      <NewspaperArchive {...args} />
    </div>
  ),
} satisfies Meta<typeof NewspaperArchive>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Empty: Story = { args: { years: [] } };
