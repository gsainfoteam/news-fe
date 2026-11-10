import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ArticleCard } from ".";
import { createMockArticle } from "../../../models/mocks";
import { toArticlePreview } from "../../../viewmodels/article-preview";

const withPhoto = toArticlePreview(createMockArticle(0));
const textOnly = toArticlePreview(createMockArticle(2));

const meta = {
  title: "Article/ArticleCard",
  component: ArticleCard,
  args: { article: withPhoto },
  render: () => (
    <div className="flex max-w-[860px] flex-col gap-10">
      <section>
        <p className="mb-2 text-xs text-subtle-foreground">lead</p>
        <ArticleCard article={withPhoto} variant="lead" priority />
      </section>
      <section>
        <p className="mb-2 text-xs text-subtle-foreground">row</p>
        <ArticleCard article={withPhoto} />
        <ArticleCard article={textOnly} />
      </section>
      <section>
        <p className="mb-2 text-xs text-subtle-foreground">stack</p>
        <div className="grid grid-cols-3 gap-7 mobile:grid-cols-1">
          <ArticleCard article={withPhoto} variant="stack" headingLevel="h3" />
          <ArticleCard
            article={toArticlePreview(createMockArticle(1))}
            variant="stack"
            headingLevel="h3"
          />
          <ArticleCard article={textOnly} variant="stack" headingLevel="h3" />
        </div>
      </section>
    </div>
  ),
} satisfies Meta<typeof ArticleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
