// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    site: 'https://tajirhasnain.com', // Public URL without port
    base: '/',
    integrations: [vue(), sitemap(), mdx()],
    i18n: {
        locales: ["bn", "en"],
        defaultLocale: "en",
    },
    markdown: {
        syntaxHighlight: 'shiki',
        shikiConfig: {
            themes: {
                light: 'github-dark',
                dark: 'github-dark'
            },
            wrap: true,
        },
    }
});