import { type Meta, type StoryObj } from "@storybook/react-vite";
import { FileTextIcon } from "lucide-react";

import { EmptyState } from "@/common/components/ui/empty-state";
import { mockUser } from "@/features/auth/models/mocks";

import { AdminLayout, AdminPageHeader } from ".";

const meta = {
  title: "Admin/AdminLayout",
  component: AdminLayout,
  args: { user: mockUser(), section: "reports", children: null },
  render: (args) => (
    <AdminLayout {...args}>
      <AdminPageHeader title="제보함" description="전체 17건, 최신순" />
      <EmptyState icon={<FileTextIcon />} title="페이지 내용" />
    </AdminLayout>
  ),
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AdminLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
