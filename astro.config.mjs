// @ts-check
import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

import expressiveCode from "astro-expressive-code";
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

// https://astro.build/config
export default defineConfig({
    site: "https://tajirhasnain.com", // Public URL without port
    base: "/",
    integrations: [vue(), sitemap(), expressiveCode({
        plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
        themes: ['one-dark-pro', 'solarized-light'],
        shiki: {}
    }), mdx()],
    i18n: {
        locales: ["bn", "en"],
        defaultLocale: "en",
    },
    markdown: {
        // syntaxHighlight: "shiki",
        // shikiConfig: {
        //     themes: {
        //         light: "github-dark",
        //         dark: "github-dark",
        //     },
        //     wrap: true,
        // },
    },
});
