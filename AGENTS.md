# Feniota Minecraft Documents — AGENTS.md

## Build & dev commands

```sh
pnpm install           # Install dependencies
pnpm run dev           # Start development server
pnpm run build         # Production build (run before pushing)
pnpm run preview       # Preview production build locally
pnpm run fmt           # Format with oxfmt
pnpm run fmt:check     # Check formatting
```

`build` runs `git fetch --unshallow` before `vitepress build` (Cloudflare Pages clones are shallow,
and `lastUpdated` needs full history). Dependencies: Node.js + pnpm. CI (Cloudflare Pages) also uses
pnpm and auto-builds on pushes to `main`.

## Architecture: VitePress docs site

Bilingual documentation site for the Phenocryst suite: Aphanite (server), Phanerite (launcher) and
Granodiorite (resource mirror). Uses the VitePress default theme extended with custom Vue
components. All content lives under `src/` (`srcDir` is set in `.vitepress/config.mts`).

### Project structure

```
.vitepress/
  config.mts              — Site config (locales, nav/sidebar, sitemap, plugins, AI Search meta)
  theme/
    index.ts              — Theme entry: extends DefaultTheme, fills layout slots
    styles.css            — Global overrides (hide VP search, AI Search snippet theming)
    components/
      AiSearchButton.vue  — Search trigger button + CF AI Search snippet
      Footer.vue          — Copyright + Minecraft disclaimer (localized via useData)
      MigrationBanner.vue — Domain-migration banner (only on phenocryst.feniota.org)
src/
  index.md                — Landing page
  installation.md         — Download links
  next-steps.md           — Post-install guidance
  aphanite/               — English docs
  phanerite/              — English docs
  granodiorite/           — English docs
  zh/                     — Chinese translations (mirror of src)
  assets/                 — Images imported by docs
  public/                 — Static files served at site root (robots.txt, schema JSON, .well-known)
  components/
    aphanite-config-toml.data.ts — Build-time data loader for the Aphanite example config
```

### Documentation location convention

- **English docs**: Under `src/` with no locale prefix, e.g. `src/aphanite/troubleshooting.md`.
- **Chinese docs**: Under `src/zh/`, e.g. `src/zh/aphanite/troubleshooting.md`.
- When syncing Chinese → English, drop the `zh/` prefix and update all internal links accordingly.
- Translations are mostly but not perfectly mirrored (e.g.
  `src/zh/aphanite/development/Phenocryst.md` has no English counterpart).
- `src/index.md` is the site's landing page; `src/public/` is the default public dir because
  `srcDir` is `./src`.

### Locales & navigation

Config in `.vitepress/config.mts` defines two locales: `root` (en) and `zh` (简体中文). Each has
independent `nav` and `sidebar`. Sidebars are keyed by prefix paths (`/`, `/aphanite/`,
`/aphanite/development/`, `/granodiorite/` and the `/zh/` counterparts). A new page needs a sidebar
entry in both locales — note the zh development sidebar currently omits the Phenocryst page.

VitePress default-theme UI strings are not auto-translated by `lang`; zh `themeConfig` overrides
them explicitly (`outlineTitle`, `lastUpdatedText`, `docFooter`, `notFound`, etc.). The llms
copy/download buttons read `themeConfig.llms` (requires `vitepress-plugin-llms` ≥ 1.14.0), while AI
Search modal strings live in `ZH_TRANSLATIONS` in `AiSearchButton.vue`.

### Dynamic config reference

`src/aphanite/configuration.md` imports the loader in `src/components/aphanite-config-toml.data.ts`,
which fetches `src/assets/config.example.toml` from the `feniota/aphanite` repository on
`git.feniota.org` (Forgejo API, `main` ref) at build/dev time. The doc highlights it with Shiki core
(`@shikijs/langs/toml`, github-dark/github-light themes) and renders a badge with the last commit
SHA. Builds therefore need network access to `git.feniota.org`.

### Search: Cloudflare AI Search

- `AiSearchButton.vue` dynamically imports `@cloudflare/ai-search-snippet` and appends
  `<search-modal-snippet>` to `<body>` on mount (avoids SSR errors and VP stacking contexts); it is
  removed on unmount.
- Endpoint is the `SEARCH_API_URL` constant in `AiSearchButton.vue`
  (`https://phenocryst-docs-search.feniota.org/`). Search opens with the button or `/` key.
- VitePress's own `.VPNavBarSearch` is hidden in `styles.css`; the button sits in the
  `nav-bar-content-before` slot wrapped in `.aisearch-wrapper`.
- Themed via `--search-snippet-*` CSS vars in `styles.css`.
- `vue.template.compilerOptions.isCustomElement` in `config.mts` marks `search-*` as native custom
  elements.

### Theme layout slots

`theme/index.ts` composes the default layout:

- `layout-top` → `MigrationBanner` (fixed banner shown only when hostname is
  `phenocryst.feniota.org`; sets `--vp-layout-top-height`)
- `nav-bar-content-before` → `AiSearchButton`
- `doc-after` → `Footer`

### Plugins

- **`vitepress-plugin-llms`**: Generates `llms.txt` / `llms-full.txt`. Configured with
  `excludeIndexPage: false`, `injectLLMHint: false`.
- **`markdown-it-footnote`**: Markdown footnote syntax support.
- **`copyOrDownloadAsMarkdownButtons`**: markdown-it plugin injecting copy/download buttons after
  `<h1>`. Vue component imported from `vitepress-plugin-llms` and registered in `theme/index.ts`.
- `transformPageData` injects `title` / `og:title` meta tags for the AI Search crawler.

### Cloudflare integration

- Domain: `mc.feniota.org` (old `phenocryst.feniota.org` shows the migration banner).
- Hosting: Cloudflare Pages (auto-builds on main branch push).
- Search: Cloudflare AI Search with public endpoint + CORS.
- Repo mirrors: Forgejo `git.feniota.org/feniota/mc-docs` and GitHub `feniota/phenocryst-docs` (both
  in `socialLinks`).

## Key conventions

- **Frontmatter**: Include `description` (used by the llms plugin for link summaries). `title` is
  optional — VitePress derives it from the H1; legal pages set it explicitly. `outline: "deep"` is
  common on long pages.
- **Callouts**: GitHub-style blockquotes (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`).
- **Footnotes**: Use `[^1]` / `[^1]:` syntax.
- **Internal links**: Absolute paths without extensions (e.g. `/aphanite/installation`), including
  the `/zh/` prefix for Chinese pages. A few legacy relative links (`./configuration`) remain;
  prefer absolute paths for new content.
- **i18n**: Chinese locale is `zh`; paths start with `/zh/`. Root is English.
- **Sitemap**: Auto-generated at build. Hostname in `config.mts`.
- **Formatting**: `oxfmt` — config in `.oxfmtrc.json`. It formats Markdown too, and for non-Chinese
  docs reflows prose to the line width (`proseWrap: "always"`, i.e. spaces become line breaks);
  `src/zh/**/*.md` uses `proseWrap: "preserve"` so Chinese text is left as written. Run
  `pnpm run fmt` after editing docs.
- **`.gitignore`** excludes `node_modules`, `deno.lock`, `.vitepress/cache`, `.vitepress/dist`.
- **`pnpm-workspace.yaml`** only sets `allowBuilds: esbuild: true` (pnpm's build-script policy).
