import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ErrorScreen } from "./index";

const meta = {
  title: "Common/ErrorScreen",
  component: ErrorScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ErrorScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NotFound: Story = { args: { variant: "notFound" } };

export const ServerError: Story = { args: { variant: "serverError" } };
