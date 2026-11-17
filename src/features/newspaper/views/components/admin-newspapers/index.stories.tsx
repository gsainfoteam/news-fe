import { type Meta, type StoryObj } from "@storybook/react-vite";

import { handleMe, mockUser } from "@/features/auth/models/mocks";
import {
  handleNewspapers,
  handleNewspapersError,
  MOCK_NEWSPAPERS,
} from "@/features/newspaper/models/mocks";

import { AdminNewspapers } from ".";

const msw = (...handlers: unknown[]) => ({ msw: { handlers } });

// Upload, edit and delete run against an in-memory archive; the S3 PUT is
// mocked with a delay so the progress bar shows.
const meta = {
  title: "Newspaper/AdminNewspapers",
  component: AdminNewspapers,
  parameters: {
    layout: "fullscreen",
    ...msw(
      handleMe(mockUser({ permission: "EDITOR" })),
      ...handleNewspapers(MOCK_NEWSPAPERS),
    ),
  },
} satisfies Meta<typeof AdminNewspapers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Empty: Story = {
  parameters: msw(
    handleMe(mockUser({ permission: "EDITOR" })),
    ...handleNewspapers([]),
  ),
};

/** The S3 PUT fails; the form stays open with a toast. */
export const UploadFails: Story = {
  parameters: msw(
    handleMe(mockUser({ permission: "EDITOR" })),
    ...handleNewspapers(MOCK_NEWSPAPERS, { putStatus: 403 }),
  ),
};

/** Registering fails once; the retry sends only `POST /newspaper`. */
export const RegisterFailsOnce: Story = {
  parameters: msw(
    handleMe(mockUser({ permission: "EDITOR" })),
    ...handleNewspapers(MOCK_NEWSPAPERS, { createFailures: 1 }),
  ),
};

/** NONE: the guard blocks the page and the menu has no archive entry. */
export const Reporter: Story = {
  parameters: msw(
    handleMe(mockUser({ permission: "NONE" })),
    ...handleNewspapers(MOCK_NEWSPAPERS),
  ),
};

export const LoadError: Story = {
  parameters: msw(
    handleMe(mockUser({ permission: "EDITOR" })),
    handleNewspapersError(),
  ),
};
