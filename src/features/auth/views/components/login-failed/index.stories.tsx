import { type Meta, type StoryObj } from "@storybook/react-vite";

import { LoginFailed } from ".";

const meta = {
  title: "Auth/LoginFailed",
  component: LoginFailed,
  args: { failure: "cancelled", onLogin: () => {}, backHref: "#" },
  argTypes: {
    failure: {
      control: "select",
      options: [
        "cancelled",
        "verification",
        "consent",
        "rejected",
        "network",
        "unknown",
      ],
    },
  },
  render: (args) => (
    <div className="px-4 py-16">
      <LoginFailed {...args} />
    </div>
  ),
} satisfies Meta<typeof LoginFailed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Verification: Story = { args: { failure: "verification" } };

/** `session_rejected` with `consent_required` off the callback page. */
export const Consent: Story = { args: { failure: "consent" } };

/** The same on /auth/callback after closing Auth/SignupDialog. */
export const ConsentSignup: Story = {
  args: { failure: "consent", onSignup: () => {} },
};

/** `session_rejected` for any other reason. */
export const Rejected: Story = { args: { failure: "rejected" } };

export const Network: Story = { args: { failure: "network" } };

export const Unknown: Story = { args: { failure: "unknown" } };
