import { defineConfig } from "vitepress";
// @ts-ignore
import footnote from "markdown-it-footnote";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Phenocryst Docs",
    description: "Documentation of Aphanite and Phanerite",
    locales: {
        root: {
            label: "English",
            lang: "en",
        },
        zh: {
            title: "Phenocryst 文档",
            description: "Aphanite 和 Phanerite 的文档",
            label: "简体中文",
            lang: "zh",
            themeConfig: {
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
                ],

                sidebar: {
                    "/zh": [
                        {
                            text: "Phenocryst",
                            items: [
                                { text: "介绍", link: "/zh/" },
                                { text: "安装", link: "/zh/installation" },
                                { text: "下一步", link: "/zh/next-step" },
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
                                    link: "/zh/aphanite/deployment",
                                },
                                {
                                    text: "配置",
                                    link: "/zh/aphanite/configuration",
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
                            ],
                        },
                    ],
                },
            },
        },
    },
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "Aphanite", link: "/aphanite/", activeMatch: "/aphanite/" },
            {
                text: "Phanerite",
                link: "/phanerite/",
                activeMatch: "/phanerite/",
            },
        ],

        sidebar: {
            "/": [
                {
                    text: "Phenocryst",
                    items: [
                        { text: "Introduction", link: "/" },
                        { text: "installation", link: "/installation" },
                        { text: "Next Step", link: "/next-step" },
                    ],
                },
            ],
            "/aphanite/": [
                {
                    text: "Aphanite",
                    items: [{ text: "Introduction", link: "/aphanite/" }],
                },
            ],
        },

        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/feniota/phenocryst-docs",
            },
        ],
    },
    markdown: {
        config: (md) => {
            md.use(footnote);
        },
    },
});
