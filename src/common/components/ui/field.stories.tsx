import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

const meta = {
  title: "Common/Field",
  component: Field,
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = {
  render: () => (
    <FieldGroup className="max-w-md">
      <Field>
        <FieldLabel htmlFor="field-name">이름</FieldLabel>
        <Input id="field-name" />
        <FieldDescription>기사에 실리지 않습니다.</FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="field-email">이메일</FieldLabel>
        <Input id="field-email" aria-invalid defaultValue="news@" />
        <FieldError>이메일 형식이 아닙니다.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="field-body">제보 내용</FieldLabel>
        <Textarea id="field-body" />
      </Field>
    </FieldGroup>
  ),
};
