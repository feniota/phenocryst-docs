# phenocryst-docs — Copilot Instructions

## Build & dev commands

```sh
pnpm run docs:dev      # Start development server
pnpm run docs:build    # Production build (run before pushing)
pnpm run docs:preview  # Preview production build locally
```

Dependencies: Node.js + pnpm. CI (Cloudflare Pages) also uses pnpm.

## Architecture: VitePress docs site

Bilingual documentation site for two projects (Aphanite — a game server; Phanerite — a launcher). Uses VitePress default theme extended with custom Vue components.

### Project structure

```
.vitepress/
  config.mts            — VitePress config (locales, nav, sitemap, llmstxt plugin)
  theme/
    index.ts            — Theme entry: extends DefaultTheme, registers components
    styles.css          — Global overrides (search modal theming, nav layout)
    components/
      AiSearchButton.vue — Search button + CF AI Search integration
public/
  robots.txt            — Crawler directives
aphanite/               — English docs
phanerite/              — English docs
zh/                     — Chinese translations (mirror of root)
```

### Documentation location convention

- **English docs**: Root of the repo (no prefix), e.g. `aphanite/troubleshooting.md`.
- **Chinese docs**: Under `zh/` prefix, e.g. `zh/aphanite/troubleshooting.md`.
- When syncing Chinese → English, drop the `zh/` prefix and update all internal links accordingly.
- Root `index.md` is the site's landing page.

### Locales & navigation

Config in `.vitepress/config.mts` defines two locales: `root` (en) and `zh` (简体中文). Each has independent `nav` and `sidebar`. Sidebar organized by prefix paths (`/`, `/aphanite/`, `/aphanite/development/` and `zh/` counterparts).

### Search: Cloudflare AI Search

- `AiSearchButton.vue` dynamically imports `@cloudflare/ai-search-snippet` and appends `<search-modal-snippet>` to `<body>` at runtime (avoids SSR errors and VP stacking contexts).
- Button click calls `document.querySelector("search-modal-snippet")?.open()`.
- Themed via `--search-snippet-*` CSS vars in `styles.css`.
- `vue.template.compilerOptions.isCustomElement` in config.mts marks `search-*` as native custom elements.

### Plugins

- **`vitepress-plugin-llms`**: Generates `llms.txt` / `llms-full.txt`. Configured with `excludeIndexPage: false`, `injectLLMHint: false`.
- **`markdown-it-footnote`**: Markdown footnote syntax support.
- **`copyOrDownloadAsMarkdownButtons`**: markdown-it plugin injecting copy/download buttons after `<h1>`. Vue component registered in `theme/index.ts`.

### Cloudflare integration

- Domain: `phenocryst.ferris.love` (Cloudflare Registrar).
- Hosting: Cloudflare Pages (auto-builds on main branch push).
- Search: Cloudflare AI Search with public endpoint + CORS.
- AI Search endpoint URL hardcoded in `AiSearchButton.vue`.

## Key conventions

- **Frontmatter**: Every `.md` file should have a `title` and optionally `description` (used by llmstxt plugin for link summaries).
- **Footnotes**: Use `[^1]` / `[^1]:` syntax.
- **Internal links**: Absolute paths without extensions (e.g. `/aphanite/installation`). No relative paths.
- **i18n**: Chinese locale is `zh`; paths start with `/zh/`. Root is English.
- **Sitemap**: Auto-generated at build. Hostname in `config.mts`.
- **Formatting**: `oxfmt` — config in `.oxfmtrc.json`.
- **`.gitignore`** excludes `node_modules`, `deno.lock`, `.vitepress/cache`, `.vitepress/dist`.
