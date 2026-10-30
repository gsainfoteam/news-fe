import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from ".";

const tabs = [
  { value: "all", label: "전체", count: 42 },
  { value: "academic", label: "학술", count: 18 },
  { value: "research", label: "연구", count: 24 },
  { value: "event", label: "학술 행사", count: 7 },
  { value: "lab", label: "연구실 탐방", count: 5 },
];

const meta = {
  title: "Common/Tabs",
  component: Tabs,
  render: () => (
    <Tabs defaultValue="all" className="max-w-2xl">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            <TabsCount>{tab.count}</TabsCount>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="text-sm">
          {tab.label} 기사 {tab.count}건
        </TabsContent>
      ))}
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
