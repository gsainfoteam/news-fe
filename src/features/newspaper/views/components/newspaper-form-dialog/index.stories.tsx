import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { NewspaperFormDialog } from ".";
import { MOCK_NEWSPAPERS } from "../../../models/mocks";

const meta = {
  title: "Newspaper/NewspaperFormDialog",
  component: NewspaperFormDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    suggestedTitle: "제73호",
    onSave: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }),
  },
} satisfies Meta<typeof NewspaperFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uploading a new paper: the next issue number is filled in. */
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** Editing keeps the current PDF unless a new one is picked. */
export const Edit: Story = { args: { target: MOCK_NEWSPAPERS[0] } };
