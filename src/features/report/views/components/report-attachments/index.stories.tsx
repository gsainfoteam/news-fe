import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ReportAttachments } from ".";
import { type ReportAttachment } from "../../../viewmodels/use-report-attachments";

const MB = 1024 ** 2;

const SAMPLE: ReportAttachment[] = [
  {
    id: "1",
    name: "lounge-door.jpg",
    size: 2.4 * MB,
    kind: "image",
    status: "done",
    progress: 1,
    key: "report/1",
  },
  {
    id: "2",
    name: "recording.m4a",
    size: 8 * MB,
    kind: "audio",
    status: "uploading",
    progress: 0.64,
  },
  {
    id: "3",
    name: "학생회관 2층 휴게 공간 사진 모음 (2026년 11월 첫째 주).zip",
    size: 12 * MB,
    kind: "archive",
    status: "failed",
    progress: 0.3,
  },
  {
    id: "4",
    name: "scan.bmp",
    size: 1 * MB,
    kind: "document",
    status: "invalid",
    issue: "type",
    progress: 0,
  },
  {
    id: "5",
    name: "interview.mov",
    size: 48 * MB,
    kind: "video",
    status: "invalid",
    issue: "size",
    progress: 0,
  },
];

// Keeps the list editable in the story without the upload hook.
function Playground() {
  const [items, setItems] = useState(SAMPLE);
  return (
    <div className="max-w-[760px]">
      <ReportAttachments
        attachments={items}
        onAdd={(files) =>
          setItems((list) => [
            ...list,
            ...files.map((file, i) => ({
              id: `${Date.now()}-${i}`,
              name: file.name,
              size: file.size,
              kind: "document" as const,
              status: "done" as const,
              progress: 1,
            })),
          ])
        }
        onRemove={(id) => setItems((list) => list.filter((a) => a.id !== id))}
        onRetry={(id) =>
          setItems((list) =>
            list.map((a) =>
              a.id === id ? { ...a, status: "done", progress: 1 } : a,
            ),
          )
        }
      />
    </div>
  );
}

const meta = {
  title: "Report/ReportAttachments",
  component: ReportAttachments,
  args: {
    attachments: SAMPLE,
    onAdd: () => {},
    onRemove: () => {},
    onRetry: () => {},
  },
  render: () => <Playground />,
} satisfies Meta<typeof ReportAttachments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
