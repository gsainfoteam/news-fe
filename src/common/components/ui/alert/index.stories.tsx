import { type Meta, type StoryObj } from "@storybook/react-vite";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Alert, AlertContent, AlertDescription, AlertTitle } from ".";

const meta = {
  title: "Common/Alert",
  component: Alert,
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Alert variant="info">
        <InfoIcon />
        <p>정보: 사이트에 반영되기까지 1~2분 걸립니다.</p>
      </Alert>
      <Alert variant="success">
        <CircleCheckIcon />
        <p>성공: 기사를 발행했습니다.</p>
      </Alert>
      <Alert variant="warning">
        <TriangleAlertIcon />
        <p>주의: 저장하지 않은 변경 사항이 있습니다.</p>
      </Alert>
      <Alert>
        <CircleAlertIcon />
        <AlertContent>
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            댓글을 쓰려면 인포팀 계정으로 로그인하세요.
          </AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  ),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
