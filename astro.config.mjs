// @ts-check
import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

import expressiveCode from "astro-expressive-code";
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// https://astro.build/config
export default defineConfig({
    site: "https://tajirhasnain.com", // Public URL without port
    base: "/",
    compressHTML: true,
    markdown: {
        processor: unified({
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
        }),
    },
    integrations: [vue(), sitemap(), expressiveCode({
        plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
        themes: ['one-dark-pro', 'solarized-light'],
    }), mdx()],
    i18n: {
        locales: ["bn", "en"],
        defaultLocale: "en",
    },
});
