import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { SignupDialog } from ".";

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Auth/SignupDialog",
  component: SignupDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    onSignup: fn(() => wait(800)),
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SignupDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Failed: Story = {
  args: {
    onSignup: fn(async () => {
      await wait(500);
      throw new Error("server_error");
    }),
  },
};
