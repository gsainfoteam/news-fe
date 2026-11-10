import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Toaster } from "@/common/components/ui/sonner";
import {
  handleArticleImageUpload,
  MOCK_EDIT_ARTICLE,
} from "@/features/article/models/editor-mocks";

import { ArticleBodyEditor } from ".";
import { useArticleImages } from "../../../viewmodels/use-article-images";

function Showcase() {
  const images = useArticleImages();
  const [html, setHtml] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card">
        <ArticleBodyEditor
          initialContent={MOCK_EDIT_ARTICLE.content}
          onLoad={setHtml}
          onChange={setHtml}
          upload={images.start}
          progress={images.progress}
        />
      </div>
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-2xs whitespace-pre-wrap">
        {html}
      </pre>
    </div>
  );
}

// The HTML below the editor is what a save sends as `content`.
const meta = {
  title: "Article/ArticleBodyEditor",
  component: ArticleBodyEditor,
  args: {
    initialContent: "",
    onLoad: () => {},
    onChange: () => {},
    upload: () => ({ id: "", done: Promise.reject(new Error()) }),
    progress: {
      subscribe: () => () => {},
      get: () => undefined,
      count: () => 0,
    },
  },
  parameters: { msw: { handlers: handleArticleImageUpload() } },
  render: () => (
    <>
      <Showcase />
      <Toaster position="bottom-center" />
    </>
  ),
} satisfies Meta<typeof ArticleBodyEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
