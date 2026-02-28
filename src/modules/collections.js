// collections.js — 文章集合定义

export function registerCollections(eleventyConfig) {

    // 所有已发布的文章
    eleventyConfig.addCollection("posts", function (collectionApi) {
        return collectionApi.getFilteredByGlob("src/posts/**/*.md")
            .filter((p) => p.data.published !== false);
    });

    // 按更新时间倒序排列的文章
    eleventyConfig.addCollection("postsByDate", function (collectionApi) {
        return collectionApi.getFilteredByGlob("src/posts/**/*.md")
            .filter((p) => p.data.published !== false)
            .sort((a, b) => {
                const dateA = new Date(a.data.last_modified_at || a.date);
                const dateB = new Date(b.data.last_modified_at || b.date);
                return dateB - dateA;
            });
    });
}
