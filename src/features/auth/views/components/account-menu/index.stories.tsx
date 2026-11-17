import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  handleMe,
  handleMeError,
  handleNoSession,
  handleSessionPending,
  mockUser,
} from "@/features/auth/models/mocks";

import { AccountMenu } from ".";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });

const meta = {
  title: "Auth/AccountMenu",
  component: AccountMenu,
  render: (args) => (
    <div className="flex h-60 items-start justify-end border-b border-border p-4">
      <AccountMenu {...args} />
    </div>
  ),
  parameters: { layout: "fullscreen", ...msw(handleMe(mockUser())) },
} satisfies Meta<typeof AccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Reader: Story = {
  parameters: msw(
    handleMe(
      mockUser({
        name: "독자",
        nickname: null,
        email: "reader@gm.gist.ac.kr",
        role: undefined,
        permission: "NONE",
      }),
    ),
  ),
};

export const LoggedOut: Story = { parameters: msw(handleNoSession()) };

export const LoggedOutMobile: Story = {
  parameters: msw(handleNoSession()),
  globals: { viewport: { value: "mobile" } },
};

export const Loading: Story = { parameters: msw(handleSessionPending()) };

export const ProfileError: Story = { parameters: msw(handleMeError()) };
