// manifest.11ty.js — PWA Manifest JSON 组件

export const data = {
    permalink: "/manifest.json",
    eleventyExcludeFromCollections: true,
};

export function render(data) {
    const { site } = data;

    const manifest = {
        short_name: site.title,
        name: site.title,
        icons: [
            {
                src: "favicon.ico",
                sizes: "64x64 32x32 24x24 16x16",
                type: "image/x-icon",
            },
        ],
        theme_color: site.appearance?.theme_color || "#03a9f4",
        background_color: site.appearance?.background_color || "#ffffff",
    };

    return JSON.stringify(manifest, null, 4);
}
