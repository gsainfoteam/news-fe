import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { NewspaperTable } from ".";
import { MOCK_NEWSPAPERS } from "../../../models/mocks";

const meta = {
  title: "Newspaper/NewspaperTable",
  component: NewspaperTable,
  args: { newspapers: MOCK_NEWSPAPERS, onEdit: fn(), onDelete: fn() },
} satisfies Meta<typeof NewspaperTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Empty: Story = { args: { newspapers: [] } };
