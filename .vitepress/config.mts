import { defineConfig } from "vitepress";
// @ts-ignore
import footnote from "markdown-it-footnote";
import llmstxt, { copyOrDownloadAsMarkdownButtons } from "vitepress-plugin-llms";

const SITE_TITLE = "Feniota Minecraft Docs";
const SITE_TITLE_ZH = "Feniota Minecraft 文档";

// Directory name → display name, used to prefix HTML titles with the product
const PRODUCTS: Record<string, string> = {
  aphanite: "Aphanite",
  phanerite: "Phanerite",
  granodiorite: "Granodiorite",
};

const EDIT_LINK_PATTERN = "https://github.com/feniota/phenocryst-docs/edit/main/src/:path";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: SITE_TITLE,
  description: "Documentation of Aphanite and Phanerite",
  srcDir: "./src",

  // sitemap for AI Search crawler
  // Auto-inject AI Search-compatible meta tags for every page
  transformPageData(pageData) {
    const isZh = pageData.relativePath === "zh" || pageData.relativePath.startsWith("zh/");
    const siteTitle = isZh ? SITE_TITLE_ZH : SITE_TITLE;
    const relativePath = isZh ? pageData.relativePath.slice("zh/".length) : pageData.relativePath;
    const product = PRODUCTS[relativePath.split("/")[0]];

    // <h1> | <product> | <site title>
    if (product && pageData.title !== product) {
      pageData.titleTemplate = `${product} | ${siteTitle}`;
    }

    const title = pageData.frontmatter.layout === "home" ? siteTitle : pageData.title;

    pageData.frontmatter.head ??= [];
    // AI Search picks up title from <meta name="title"> or <meta property="og:title">
    pageData.frontmatter.head.push(["meta", { name: "title", content: title }]);
    pageData.frontmatter.head.push(["meta", { property: "og:title", content: title }]);
  },

  lastUpdated: true,
  sitemap: {
    hostname: "https://mc.feniota.org",
  },

  // Tell the Vue template compiler that CF AI Search web components
  // (e.g. <search-modal-snippet>) are native custom elements, not Vue
  // components — eliminates dev-mode runtime warnings.
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => tag.startsWith("search-"),
      },
    },
  },

  vite: {
    plugins: [
      llmstxt({
        excludeIndexPage: false,
        injectLLMHint: true,
      }),
    ],
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    zh: {
      title: SITE_TITLE_ZH,
      description: "Aphanite 和 Phanerite 的文档",
      label: "简体中文",
      lang: "zh",
      themeConfig: {
        editLink: {
          pattern: EDIT_LINK_PATTERN,
          text: "在 GitHub 上编辑此页面",
        },
        outline: { label: "页面导航" },
        lastUpdated: { text: "最后更新于" },
        docFooter: { prev: "上一页", next: "下一页" },
        returnToTopLabel: "回到顶部",
        sidebarMenuLabel: "菜单",
        darkModeSwitchLabel: "主题",
        lightModeSwitchTitle: "切换到浅色模式",
        darkModeSwitchTitle: "切换到深色模式",
        langMenuLabel: "多语言",
        skipToContentLabel: "跳转到内容",
        notFound: {
          title: "页面未找到",
          quote: "但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。",
          linkLabel: "前往首页",
          linkText: "带我回首页",
        },
        llms: {
          copyText: "复制页面",
          copiedText: "已复制",
          viewMarkdownText: "查看 Markdown",
          openInAIText: "在 {provider} 中打开",
        },
        nav: [
          {
            text: "首页",
            link: "/zh/",
          },
          {
            text: "Aphanite",
            link: "/zh/aphanite/",
            activeMatch: "/aphanite/",
          },
          {
            text: "Phanerite",
            link: "/zh/phanerite/",
            activeMatch: "/phanerite/",
          },
          {
            text: "Granodiorite",
            link: "/zh/granodiorite/",
            activeMatch: "/granodiorite/",
          },
        ],

        sidebar: {
          "/zh": [
            {
              text: "Phenocryst",
              items: [
                { text: "介绍", link: "/zh/" },
                { text: "安装", link: "/zh/installation" },
                { text: "下一步", link: "/zh/next-steps" },
              ],
            },
          ],
          "/zh/aphanite/": [
            {
              text: "Aphanite",
              items: [
                { text: "介绍", link: "/zh/aphanite/" },
                {
                  text: "安装",
                  link: "/zh/aphanite/installation",
                },
                {
                  text: "运行",
                  link: "/zh/aphanite/running",
                },
                {
                  text: "配置",
                  link: "/zh/aphanite/configuration",
                },
                {
                  text: "部署",
                  link: "/zh/aphanite/deployment",
                },
                {
                  text: "变更日志",
                  link: "/zh/aphanite/changelog",
                },
                {
                  text: "开发者文档",
                  link: "/zh/aphanite/development/",
                },
              ],
            },
          ],
          "/zh/aphanite/development/": [
            {
              text: "Aphanite 开发者文档",
              items: [
                {
                  text: "首页",
                  link: "/zh/aphanite/development/",
                },
                {
                  text: "General API",
                  link: "/zh/aphanite/development/Aphanite General",
                },
                {
                  text: "Yggdrasil API",
                  link: "/zh/aphanite/development/Yggdrasil",
                },
              ],
            },
          ],
          "/zh/granodiorite/": [
            {
              text: "Granodiorite",
              items: [
                { text: "介绍", link: "/zh/granodiorite/" },
                { text: "使用条款", link: "/zh/granodiorite/terms" },
              ],
            },
          ],
        },
      },
    },
  },
  themeConfig: {
    editLink: {
      pattern: EDIT_LINK_PATTERN,
      text: "Edit this page on GitHub",
    },
    footer: {
      message: "msg",
      copyright: "cr",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Aphanite", link: "/aphanite/", activeMatch: "/aphanite/" },
      {
        text: "Phanerite",
        link: "/phanerite/",
        activeMatch: "/phanerite/",
      },
      {
        text: "Granodiorite",
        link: "/granodiorite/",
        activeMatch: "/granodiorite/",
      },
    ],

    sidebar: {
      "/": [
        {
          text: "Phenocryst",
          items: [
            { text: "Introduction", link: "/" },
            { text: "Installation", link: "/installation" },
            { text: "Next Steps", link: "/next-steps" },
          ],
        },
      ],
      "/aphanite/": [
        {
          text: "Aphanite",
          items: [
            { text: "Introduction", link: "/aphanite/" },
            {
              text: "Installation",
              link: "/aphanite/installation",
            },
            {
              text: "Running",
              link: "/aphanite/running",
            },
            {
              text: "Configuration",
              link: "/aphanite/configuration",
            },
            {
              text: "Deployment",
              link: "/aphanite/deployment",
            },
            {
              text: "Changelog",
              link: "/aphanite/changelog",
            },
            {
              text: "Developer Docs",
              link: "/aphanite/development/",
            },
          ],
        },
      ],
      "/aphanite/development/": [
        {
          text: "Aphanite Developer Docs",
          items: [
            { text: "Home", link: "/aphanite/development/" },
            {
              text: "General API",
              link: "/aphanite/development/Aphanite General",
            },
            {
              text: "Yggdrasil API",
              link: "/aphanite/development/Yggdrasil",
            },
          ],
        },
      ],
      "/granodiorite/": [
        {
          text: "Granodiorite",
          items: [
            { text: "Introduction", link: "/granodiorite/" },
            { text: "Terms of Service", link: "/granodiorite/terms" },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: "forgejo",
        link: "https://git.feniota.org/feniota/mc-docs",
      },
      {
        icon: "github",
        link: "https://github.com/feniota/phenocryst-docs",
      },
    ],
  },
  markdown: {
    config: (md) => {
      md.use(footnote);
      md.use(copyOrDownloadAsMarkdownButtons);
    },
  },
});
