import { type Meta, type StoryObj } from "@storybook/react-vite";

import { NoticeList } from ".";
import { MOCK_NOTICES } from "../../../models/mocks";
import { paginateNotices } from "../../../viewmodels/notice";

const [first] = paginateNotices(MOCK_NOTICES);

const meta = {
  title: "Notice/NoticeList",
  component: NoticeList,
  parameters: { layout: "fullscreen" },
  args: first,
  render: (args) => (
    <div className="page-container">
      <NoticeList {...args} />
    </div>
  ),
} satisfies Meta<typeof NoticeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };

export const Empty: Story = {
  args: { notices: [], total: 0, page: { current: 1, last: 1 } },
};
