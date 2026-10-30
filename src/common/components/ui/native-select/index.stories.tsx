import { type Meta, type StoryObj } from "@storybook/react-vite";

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from ".";

const meta = {
  title: "Common/NativeSelect",
  component: NativeSelect,
  render: () => (
    <div className="grid max-w-2xl grid-cols-2 gap-4 mobile:grid-cols-1">
      <NativeSelect aria-label="카테고리">
        <NativeSelectOption>전체 카테고리</NativeSelectOption>
        <NativeSelectOptGroup label="학술·연구">
          <NativeSelectOption>학술</NativeSelectOption>
          <NativeSelectOption>연구</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
      <NativeSelect aria-label="정렬" aria-invalid>
        <NativeSelectOption>최신순</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="비활성" disabled>
        <NativeSelectOption>비활성</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
