import { type Meta, type StoryObj } from "@storybook/react-vite";

import { handleAbout, handleAboutError } from "@/features/about/models/mocks";
import { handleMe, mockUser } from "@/features/auth/models/mocks";

import { AdminAbout } from ".";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });

const meta = {
  title: "About/AdminAbout",
  component: AdminAbout,
  parameters: {
    layout: "fullscreen",
    ...msw(handleMe(mockUser({ permission: "EDITOR" })), ...handleAbout()),
  },
} satisfies Meta<typeof AdminAbout>;

export default meta;
type Story = StoryObj<typeof meta>;

// EDITOR is the lowest permission news-be lets edit the about.
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Reporter: Story = {
  parameters: msw(handleMe(mockUser({ permission: "NONE" })), ...handleAbout()),
};

export const LoadError: Story = {
  parameters: msw(
    handleMe(mockUser({ permission: "EDITOR" })),
    handleAboutError(),
  ),
};
