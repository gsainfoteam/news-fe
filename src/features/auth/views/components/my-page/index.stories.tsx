import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  handleNicknameChange,
  handleNoSession,
  mockUser,
} from "@/features/auth/models/mocks";

import { MyPage } from ".";
import { AccountMenu } from "../account-menu";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });

// `/me` with the header's account menu beside it: both islands read one
// query cache, so a saved nickname shows in the open menu right away.
const meta = {
  title: "Auth/MyPage",
  component: MyPage,
  render: () => (
    <div className="flex flex-col">
      <div className="flex justify-end border-b border-border px-4 py-3">
        <AccountMenu />
      </div>
      <div className="px-4">
        <MyPage />
      </div>
    </div>
  ),
  parameters: {
    layout: "fullscreen",
    ...msw(...handleNicknameChange(mockUser())),
  },
} satisfies Meta<typeof MyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** A reader with no newsroom role and no nickname yet. */
export const Reader: Story = {
  parameters: msw(
    ...handleNicknameChange(
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
