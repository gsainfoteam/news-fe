import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { MOCK_MEMBERS } from "@/features/article/models/editor-mocks";

import { AuthorPicker } from ".";
import { getAuthorOptions } from "../../../viewmodels/article-editor";

const options = getAuthorOptions(MOCK_MEMBERS);

function Showcase() {
  const [value, setValue] = useState([options[0].id, options[1].id]);
  return (
    <div className="h-96 w-80 max-w-full">
      <AuthorPicker options={options} value={value} onChange={setValue} />
    </div>
  );
}

const meta = {
  title: "Article/AuthorPicker",
  component: AuthorPicker,
  args: { options, value: [], onChange: () => {} },
  render: () => <Showcase />,
} satisfies Meta<typeof AuthorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
