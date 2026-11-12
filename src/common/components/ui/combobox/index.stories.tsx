import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from ".";

const PEOPLE = ["김도윤", "이서연", "박지호", "박서윤", "최하은", "정민준"];

function Showcase() {
  const anchor = useComboboxAnchor();
  const [value, setValue] = useState(["김도윤", "이서연"]);
  return (
    <div className="h-80 w-80 max-w-full">
      <Combobox items={PEOPLE} multiple value={value} onValueChange={setValue}>
        <ComboboxChips ref={anchor}>
          {value.map((name) => (
            <ComboboxChip key={name} removeLabel={`${name} 빼기`}>
              {name}
            </ComboboxChip>
          ))}
          <ComboboxChipsInput aria-label="멤버 검색" placeholder="멤버 검색" />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>일치하는 멤버가 없습니다</ComboboxEmpty>
          <ComboboxList>
            {(name: string) => (
              <ComboboxItem key={name} value={name}>
                {name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

const meta = {
  title: "Common/Combobox",
  component: Combobox,
  render: () => <Showcase />,
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
