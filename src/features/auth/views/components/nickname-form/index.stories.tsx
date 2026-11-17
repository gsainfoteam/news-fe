import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  handleNicknameChange,
  handleNicknameError,
  mockUser,
} from "@/features/auth/models/mocks";

import { NicknameForm } from ".";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });
const user = mockUser();

// The nickname field on /me. Saving writes the new nickname into the shared
// `me` cache (see Auth/MyPage for the header picking it up).
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

/** No nickname yet: the field is empty and shows the name as a hint. */
export const Empty: Story = { args: { user: mockUser({ nickname: null }) } };

export const SaveError: Story = { parameters: msw(handleNicknameError()) };
