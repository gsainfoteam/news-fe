# News FE (Astro)

## Environment & Tooling

- Use Bun for installs, scripts, and lockfile updates.
- Run lint/format tasks with Bun (`bun run lint`, `bun run check`, `bun run format`).
- Routing is file-based via **Astro** (`src/pages/`). Each `.astro`/`.md` file under `src/pages/` is a route; no codegen step is required.
- All reusable views — UI primitives, the layout frame (header/footer/nav), and feature view components — are authored in **React** and developed in Storybook (`bun run storybook`). Astro route shells/pages consume them as components — rendered to static HTML by default, hydrated only when a `client:*` directive is added.
- **Code generation** (outputs land in `src/@types/`, which is git-ignored):
  - `bun run gen:api` — regenerate `src/@types/api-schema.ts` from the Swagger/OpenAPI spec (`scripts/gen-api.ts`, reads `SWAGGER_URL`/`SWAGGER_USER`/`SWAGGER_PASSWORD`).
  - `bun run gen:i18n` — extract translation keys to `public/locales/{lng}/{ns}.json` and regenerate i18next types (`i18next-cli`).
- **Environment variables**: declared in the `astro:env` schema (`astro.config.mjs`). See `.env.example`.
  - `API_BASE_URL` (`context: "server"`): used while building pages. Import from `astro:env/server`.
  - `PUBLIC_API_BASE_URL` (`context: "client"`): used by browser islands. Import from `astro:env/client`.
  - `SWAGGER_*`: read only by `scripts/gen-api.ts`.

## Rendering & Deployment (Event-driven SSG)

- `output: "static"` (the default) with no adapter. `astro build` writes plain HTML to `dist/`, which is deployed to Cloudflare Pages. There is no server.
- **Build-time data**: home, category, and article pages load API data while building (`getStaticPaths` and frontmatter call ViewModels). A page shows the data as of the last build.
- **Rebuild triggers**: push to `main`, manual `workflow_dispatch`, and `repository_dispatch` with event type `article-changed` (the backend sends it when an article is created, updated, or deleted). No cron.
- **CSR islands**: search, comments, login, reports, and `/admin` run in the browser as React islands (`client:only="react"`, `client:visible`, …) and call the API directly.
- **Dynamic ids**: every path param (`[id]`, `[slug]`) must be known at build time. Ids that only exist after the build (CMS pages) go in the query string: `/admin/articles/edit?id=…`, not `/admin/articles/[id]`.
- **Language by URL**: `/` is Korean and `/en/` is English. Every static page is built in both languages.

## Project Structure

### MVVM & Feature-Based Architecture

This project follows the MVVM (Model-View-ViewModel) pattern and a feature-based file structure, adapted for Astro:

- **Features**: `src/features/` — Feature modules organized by domain
  - Each feature contains: `models/`, `viewmodels/`, `views/`, `index.ts`
- **Common**: `src/common/` — Shared code across features
  - `components/` — Reusable UI components (`ui/` primitives + `layout/` frame)
  - `lib/` — Library configurations: `cn`/`cv` (styling), `api` (openapi-fetch client), `i18n` (i18next + react-i18next), `dayjs`, `languages`
  - `utils/` — Utility functions
  - `const/` — Shared constants
- **Locales**: `public/locales/{lng}/{ns}.json` — translation resources (committed; managed by `gen:i18n`).
- **Routes & Shells** (Astro-specific, top layer):
  - `src/pages/` — File-based routes. Thin: they call ViewModels in frontmatter and render Views.
  - `src/layouts/` — Route-level Astro shells (page wrappers composing the layout frame).
  - `src/styles/` — Global styles and Tailwind theme tokens.

### MVVM in Astro

The View → ViewModel → Model flow is preserved, but "View" spans two technologies:

- **Model** — Pure TS. Domain types, constants, and data sources (API clients / repositories). The bottom layer.
- **ViewModel** — Presentation logic that turns Model data into view-ready values. Framework-agnostic functions called from Astro frontmatter (`---`) and from React views. For interactive React islands they may be hooks (`use-*`); for static rendering they are plain functions.
- **View** — The presentation layer, in two forms:
  - **React** (`.tsx`) — UI primitives (`common/components/ui/`), the layout frame (`common/components/layout/` — header/footer/nav/error screens), and feature view components (`features/*/views/`). Developed in Storybook.
  - **Astro** (`.astro`) — Route shells (`src/layouts/`) and pages (`src/pages/`). These compose React Views, run frontmatter logic (routing, data loading), and own any vanilla `<script>` for browser behavior.

Astro pages/components fetch data by calling ViewModels in their frontmatter and pass the result down as props. Views never reach into Models for data.

### Layer Access Rules

Enforced by `eslint-plugin-boundaries`:

- **View → ViewModel → Model**: Views access Model **data/logic** only through ViewModels.
  - Views cannot import a Model's data/logic directly; go through a ViewModel.
  - ViewModels cannot reference Views (UI components).
  - Models are the bottom layer and cannot reference ViewModels or Views.
- **Type exception**: Views may import **types** from a feature's `models/index.ts` (see API Schema Types). This is for typing props only — not for pulling data.
- **Common `ui/`** primitives cannot import from `@/features/*`.
- **Cross-feature**: a feature may import another feature only through its public `index.ts`.

### API Schema Types

- **Do NOT** import types directly from `@/@types/api-schema` outside of model files.
- **DO** import types from each feature's `models/index.ts` (re-exported through the feature `index.ts`).
- Exception: `src/features/*/models/**/*.ts` and `src/common/lib/api.ts` may import directly.
- The typed client lives in `src/common/lib/api.ts` (`openapi-fetch`); `src/@types/api-schema.ts` is generated by `bun run gen:api`. Feature **Models** own all API access — call `api` from there, never from Views/ViewModels.

### Internationalization & Dates

- Translate UI strings with `react-i18next` (`useTranslation`) in **React** views; in `.astro` frontmatter use the `i18n.t` instance from `@/common/lib/i18n`. Always pass a default value so static (server) renders are meaningful.
- Keys use `ns:key` (`nsSeparator: ":"`) with the `_` default namespace. Run `bun run gen:i18n` after adding/removing `t()` calls.
- Because Astro renders statically, the i18next HTTP backend loads `public/locales` **on the client**; the server render falls back to the inline default values. (`i18n.init` is fire-and-forget with `react.useSuspense: false` so the static build never blocks on a network fetch.)
- Use `dayjs` from `@/common/lib/dayjs` for date formatting — its locale stays in sync with the active i18next language.

### Cross-Layer / Cross-Feature Imports

- **From outside a feature** (pages, layouts, common layout, another feature), import only through the feature's public `index.ts`. Do not reach into its internal layers.
  - Example: Import from `@/features/article`, not `@/features/article/viewmodels/article-list`.
- **Inside a feature**, layers import each other directly along the allowed direction (View → ViewModel → Model). Do not route a feature's own internal imports through its `index.ts` (that would create a cycle).
- Use the feature `index.ts` to re-export the public surface (view components, the viewmodels and model types meant for outside consumers).

## Naming Conventions

Enforced by `eslint-plugin-check-file`:

- All files and folders under `src/` must use **kebab-case**.
  - Examples: `article-list-card/`, `category-badge.ts`, `badge-variant.ts`
- Exception: `src/pages/` is exempt — Astro routing requires its own file naming convention (e.g. `[category].astro`, `index.astro`).
- React component files are `index.tsx`; Astro component files are `index.astro` (see Component Folder below).

## Import Conventions

Enforced by `eslint-plugin-import-x`:

- Import order (each group separated by a blank line):
  1. `builtin`
  2. `external` — `react` goes first within this group
  3. `internal` — path aliases (`@/**`)
  4. `parent` / `sibling` / `index`
  5. `type`
- Use inline type imports: `import { type Foo } from '...'` (not `import type { Foo }`).
- No duplicate imports.
- No unused imports (error).
- Use the `@/*` path alias for `src/*` instead of long relative paths.

## Components Structure

### `src/common/components/`

Split into **`ui/`** (primitives) and **`layout/`** (frame):

#### `ui/` — Primitive components (React)

- No feature/domain imports: do not import from `@/features/*`.
- Do not use feature viewmodels, domain logic, or `useTranslation` — primitives stay content-agnostic; pass translated text in as props.
- Single-purpose building blocks mapping to one element or a small generic pattern.
- Authored in React (`.tsx`) and covered by Storybook.

#### `layout/` — Frame components (React composites)

- Layout-level pieces (header, footer, navigation frame, error screens).
- May import from `ui/`, `@/features/*` (through their `index.ts`), `@/common/lib` (incl. `useTranslation`, dayjs), unlike `ui/` primitives.
- Authored in React (`.tsx`) and covered by Storybook.
- Receive routing data as props (e.g. `Header` takes `currentPath`); the Astro route shell passes `Astro.url.pathname` down.

### View Technology Rules

- A component that should appear in Storybook must be **React** (`.astro` is not supported by Storybook).
  - `common/components/ui/*`, `common/components/layout/*`, and `features/*/views/components/*` → React.
- Only the route layer stays **Astro**: `src/layouts/*` (shells) and `src/pages/*`. These run frontmatter logic (routing, data loading) and hold any vanilla `<script>` for browser behavior, driving the React-rendered DOM by `id`/`data-*` (no hydration needed).
- React Views are rendered to static HTML by Astro with **zero client JS** by default. Add `client:load` / `client:visible` etc. only when a component itself needs interactivity.

### Component Type Conventions

- **React** components: use namespace merging for component-related types such as props and state.

```tsx
export function Button({ label, variant }: Button.Props) { ... }

export namespace Button {
  export type Props = {
    label: string;
    variant?: "primary" | "secondary";
  };
}
```

- **Astro** components: use the built-in `interface Props { ... }` convention (Astro types `Astro.props` from it). Export shared prop types separately when they need to be reused.

### Component Folder & Storybook

- Each component lives in a **folder named after the component** (kebab-case).
- **Implementation**: `index.tsx` (React) or `index.astro` (Astro) inside that folder.
- **Storybook** (React only): `index.stories.tsx` in the same folder.
- Story `title` uses a domain prefix for sidebar grouping:
  - `Common/` — `src/common/components/` (e.g. `Common/Button`)
  - `<Feature>/` — `src/features/<feature>/views/components/` (e.g. `Article/ArticleCard`)

### Storybook Setup

- Stories are picked up from `src/**/*.stories.tsx` via `@storybook/react-vite`. The global stylesheet (`src/styles/global.css`) and Tailwind theme tokens are loaded in `.storybook/preview.tsx` so stories render with project styling.
- **Dark / Light mode**: toolbar toggle via `@storybook/addon-themes` (`withThemeByDataAttribute`), which sets `data-theme="dark"`/`"light"`. Tailwind's `dark:` variant responds to it (configured by `@custom-variant dark` in `global.css`).
- **i18n locale**: toolbar toggle (`ko`/`en`) wired by the `withLocale` decorator (`.storybook/decorators.tsx`) — it calls `i18n.changeLanguage` and wraps stories in `I18nextProvider`; dayjs locale syncs automatically. `public/` is served via `staticDirs` so the HTTP backend can load `/locales/*`.

## Commits & PRs

- Title format: `<type>: <title>`
- `<title>` uses imperative mood (e.g., add, fix, update).
- `<type>` options:
  - `feat`: New feature or capability.
  - `fix`: Bug or incorrect behavior fix.
  - `docs`: Documentation-only changes.
  - `style`: Code style/format changes with no behavior impact.
  - `refactor`: Code structure improvements without behavior changes.
  - `test`: Adds or updates tests.
  - `chore`: Maintenance tasks that don't affect runtime behavior.
  - `ci`: Changes to CI/CD configuration.

## LLM Guidance

- Responses must be in Korean.
- Follow requested formats (especially commit/PR titles).
- Avoid destructive commands (e.g., `git reset --hard`) unless explicitly requested.
