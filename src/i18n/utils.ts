import { ui, defaultLang } from './ui';

export const showDefaultLang = false;

export function getLangFromUrl(url: URL) {
    const [, lang] = url.pathname.split('/');
    if (lang in ui) return lang as keyof typeof ui;
    return defaultLang;
}

export function getPathFromUrl(url: URL) {
    const segments = url.pathname.split('/').filter(Boolean);
    const langs = new Set(['en', 'bn']);
    if (segments.length > 0 && langs.has(segments[0])) {
        segments.shift();
    }
    return '/' + segments.join('/');
}

export function useTranslations(lang: keyof typeof ui) {
    return function t(key: keyof typeof ui[typeof defaultLang]) {
        return ui[lang][key] || ui[defaultLang][key];
    }
}

export function useTranslatedPath(lang: keyof typeof ui) {
    return function translatePath(path: string, l: string = lang) {
        if(path.includes('/blog/')) {
            return `/${l}${path}`
        }
        return !showDefaultLang && l === defaultLang ? path : `/${l}${path}`
    }
}
