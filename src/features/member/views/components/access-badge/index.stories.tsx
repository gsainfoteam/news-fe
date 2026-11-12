import { type Meta, type StoryObj } from "@storybook/react-vite";

import { AccessBadge } from ".";
import { ACCESS_LEVELS } from "../../../viewmodels/member-role";

const LABELS = {
  EDITORSHIP: "전체 관리",
  EDITOR: "편집",
  NONE: "권한 없음",
  ALUMNI: "접근 불가",
} as const;

const meta = {
  title: "Member/AccessBadge",
  component: AccessBadge,
  args: { level: "EDITORSHIP", label: LABELS.EDITORSHIP },
  render: () => (
    <div className="flex flex-wrap gap-2 p-6">
      {ACCESS_LEVELS.map((level) => (
        <AccessBadge key={level} level={level} label={LABELS[level]} />
      ))}
    </div>
  ),
} satisfies Meta<typeof AccessBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
