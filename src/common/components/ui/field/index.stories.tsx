import { type Meta, type StoryObj } from "@storybook/react-vite";
import { SearchIcon } from "lucide-react";

import { Checkbox } from "@/common/components/ui/checkbox";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/common/components/ui/native-select";
import { Textarea } from "@/common/components/ui/textarea";

import { Field, FieldDescription, FieldError, FieldLabel, FieldTitle } from ".";

const meta = {
  title: "Common/Field",
  component: Field,
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 mobile:grid-cols-1">
        <Field>
          <FieldLabel htmlFor="f-basic">기본</FieldLabel>
          <Input id="f-basic" placeholder="placeholder" />
        </Field>
        <Field>
          <FieldLabel htmlFor="f-focus">포커스</FieldLabel>
          <Input id="f-focus" defaultValue="입력 중" />
        </Field>
        <Field>
          <FieldLabel htmlFor="f-error" required>
            오류
          </FieldLabel>
          <Input id="f-error" defaultValue="010-1234-567" aria-invalid />
          <FieldError>전화번호 형식을 확인해 주세요</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="f-select" optional="(선택)">
            선택
          </FieldLabel>
          <NativeSelect id="f-select">
            <NativeSelectOption>전체 카테고리</NativeSelectOption>
          </NativeSelect>
          <FieldDescription>도움말 텍스트</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="f-search">검색</FieldLabel>
          <Input
            id="f-search"
            type="search"
            icon={<SearchIcon />}
            placeholder="기사 검색"
          />
        </Field>
        <Field>
          <FieldTitle>체크박스</FieldTitle>
          <div className="flex h-[42px] items-center gap-4">
            <Label className="font-normal">
              <Checkbox defaultChecked />
              학술·연구
            </Label>
            <Label className="font-normal">
              <Checkbox />
              연구
            </Label>
          </div>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="f-textarea">Textarea</FieldLabel>
        <Textarea id="f-textarea" defaultValue="여러 줄 입력" />
      </Field>
    </div>
  ),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
