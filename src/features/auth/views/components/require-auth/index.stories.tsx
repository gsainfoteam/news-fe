import { type Meta, type StoryObj } from "@storybook/react-vite";
import { UserRoundIcon } from "lucide-react";

import { EmptyState } from "@/common/components/ui/empty-state";
import {
  handleMe,
  handleMeError,
  handleNoSession,
  handleSessionError,
  mockUser,
} from "@/features/auth/models/mocks";

import { RequireAuth } from ".";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });

// A page behind a login (`/me`), by session state. The CMS uses the same
// guard with its own frame (Admin/AdminGuard).
const meta = {
  title: "Auth/RequireAuth",
  component: RequireAuth,
  args: { children: null },
  render: () => (
    <RequireAuth>
      {({ user }) => (
        <div className="p-8">
          <EmptyState
            icon={<UserRoundIcon />}
            title={`${user.name}님의 페이지`}
            description="로그인하면 보이는 내용"
          />
        </div>
      )}
    </RequireAuth>
  ),
  parameters: { layout: "fullscreen", ...msw(handleMe(mockUser())) },
} satisfies Meta<typeof RequireAuth>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** No session: a login prompt in place of the page. */
export const LoggedOut: Story = { parameters: msw(handleNoSession()) };

/** Restoring the session failed: the login failure screen. */
export const SessionError: Story = { parameters: msw(handleSessionError()) };

/** Logged in, but `GET /user/me` failed: retry. */
export const ProfileError: Story = { parameters: msw(handleMeError()) };
