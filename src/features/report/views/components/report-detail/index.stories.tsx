import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import {
  MOCK_REPORT_DOWNLOAD_URL,
  MOCK_REPORTS,
} from "@/features/report/models/mocks";

import { ReportDetail } from ".";

const report = {
  ...MOCK_REPORTS[0]!,
  files: MOCK_REPORTS[0]!.files.map((f) => ({
    ...f,
    url: `${MOCK_REPORT_DOWNLOAD_URL}/${f.name}`,
  })),
};

const meta = {
  title: "Report/ReportDetail",
  component: ReportDetail,
  args: {
    report,
    linksExpired: false,
    onRefreshLinks: fn(),
    onFileClick: fn(),
    writeArticleHref: "/admin/articles/new",
  },
  render: (args) => (
    <div className="max-w-[760px] p-8 mobile:p-4">
      <ReportDetail {...args} />
    </div>
  ),
} satisfies Meta<typeof ReportDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

/** Opened more than 10 minutes ago: the download links have lapsed. */
export const LinksExpired: Story = { args: { linksExpired: true } };

/** No title, no files, and a member who can't write articles. */
export const Minimal: Story = {
  args: { report: MOCK_REPORTS[1]!, writeArticleHref: undefined },
};
