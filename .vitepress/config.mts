import { defineConfig } from "vitepress";

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
                    { text: "首页", link: "/zh/" },
                    { text: "Aphanite", link: "/zh/aphanite/" },
                    { text: "Phanerite", link: "/zh/phanerite/" },
                ],

                sidebar: {
                    "/zh": [
                        {
                            text: "Phenocryst",
                            items: [
                                { text: "Aphanite", link: "/aphanite/" },
                                { text: "Phanerite", link: "/phanerite/" },
                            ],
                        },
                    ],
                    "/zh/aphanite/": [
                        {
                            text: "Aphanite",
                            items: [{ text: "介绍", link: "/zh/aphanite/" }],
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
            { text: "Aphanite", link: "/aphanite/" },
            { text: "Phanerite", link: "/phanerite/" },
        ],

        sidebar: {
            "/": [
                {
                    text: "Phenocryst",
                    items: [
                        { text: "Aphanite", link: "/aphanite/" },
                        { text: "Phanerite", link: "/phanerite/" },
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
});
