import { type Meta, type StoryObj } from "@storybook/react-vite";

import { queryClient } from "@/common/lib/query-client";
import { handleMe, mockUser } from "@/features/auth/models/mocks";
import { reportQueryKey } from "@/features/report/models";
import {
  handleReports,
  handleReportsError,
  MOCK_REPORT_DOWNLOAD_URL,
  MOCK_REPORTS,
} from "@/features/report/models/mocks";
import { REPORT_FILE_LINK_LIFETIME_MS } from "@/features/report/viewmodels/report-inbox";

import { AdminReports } from ".";

const me = handleMe(mockUser({ permission: "EDITOR" }));

// Paging and opening reports run against the in-memory list; the URL is
// left alone (`initialLocation`).
const meta = {
  title: "Report/ReportInbox",
  component: AdminReports,
  args: { initialLocation: { id: 23, page: 1 } },
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [me, ...handleReports(MOCK_REPORTS)] },
  },
} satisfies Meta<typeof AdminReports>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** `/admin/reports`: nothing open yet. */
export const ListOnly: Story = { args: { initialLocation: { page: 1 } } };

export const MobileList: Story = {
  ...ListOnly,
  globals: { viewport: { value: "mobile" } },
};

export const Empty: Story = {
  args: { initialLocation: { page: 1 } },
  parameters: { msw: { handlers: [me, ...handleReports([])] } },
};

/** The list request fails; the guard still passes. */
export const LoadError: Story = {
  args: { initialLocation: { page: 1 } },
  parameters: { msw: { handlers: [me, handleReportsError()] } },
};

/** `/admin/reports/view?id=` with an id that doesn't exist. */
export const NotFound: Story = {
  args: { initialLocation: { id: 999, page: 1 } },
};

/**
 * The report was fetched almost 9 minutes ago, so its links lapse two
 * seconds in. "새 링크 받기" fetches it again from the mock API.
 */
export const LinksExpired: Story = {
  loaders: [
    // Runs after the global loader that clears the shared cache.
    () => {
      const report = MOCK_REPORTS[0]!;
      queryClient.setQueryData(
        reportQueryKey({ path: { id: report.id } }),
        {
          ...report,
          files: report.files.map((f) => ({
            ...f,
            url: `${MOCK_REPORT_DOWNLOAD_URL}/${report.id}/${f.name}?signed=old`,
          })),
        },
        { updatedAt: Date.now() - REPORT_FILE_LINK_LIFETIME_MS + 2_000 },
      );
    },
  ],
};
