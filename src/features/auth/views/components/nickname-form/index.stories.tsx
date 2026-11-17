import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  handleNicknameChange,
  handleNicknameError,
  mockUser,
} from "@/features/auth/models/mocks";

import { NicknameForm } from ".";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });
const user = mockUser();

const meta = {
  title: "Auth/NicknameForm",
  component: NicknameForm,
  args: { user },
  render: (args) => (
    <div className="max-w-[560px] p-6 mobile:p-4">
      <NicknameForm {...args} />
    </div>
  ),
  parameters: msw(...handleNicknameChange(user)),
} satisfies Meta<typeof NicknameForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Empty: Story = { args: { user: mockUser({ nickname: null }) } };

export const SaveError: Story = { parameters: msw(handleNicknameError()) };
