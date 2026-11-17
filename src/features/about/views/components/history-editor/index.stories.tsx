import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { type HistoryEntry, type HistoryInput } from "@/features/about/models";
import { MOCK_ABOUT } from "@/features/about/models/mocks";

import { HistoryEditor } from ".";

// Keeps the list in story state so add, edit and delete show their result.
function Stateful({ initial }: { initial: HistoryEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [nextId, setNextId] = useState(1000);
  return (
    <HistoryEditor
      entries={entries}
      onAdd={async (input: HistoryInput) => {
        setEntries((list) => [...list, { id: nextId, ...input }]);
        setNextId((id) => id + 1);
      }}
      onUpdate={async (id, input) =>
        setEntries((list) =>
          list.map((e) => (e.id === id ? { ...e, ...input } : e)),
        )
      }
      onDelete={async (id) =>
        setEntries((list) => list.filter((e) => e.id !== id))
      }
    />
  );
}

const meta = {
  title: "About/HistoryEditor",
  component: HistoryEditor,
  args: {
    entries: MOCK_ABOUT.histories,
    onAdd: async () => {},
    onUpdate: async () => {},
    onDelete: async () => {},
  },
  render: (args) => (
    <div className="max-w-[960px]">
      <Stateful initial={args.entries} />
    </div>
  ),
} satisfies Meta<typeof HistoryEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
