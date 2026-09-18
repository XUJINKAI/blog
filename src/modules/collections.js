// collections.js — 文章集合定义

function publishedPosts(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/**/*.md")
        .filter((post) => post.data.published !== false);
}

function activityTime(post) {
    return new Date(post.data.last_modified_at || post.date).getTime();
}

function byActivityDesc(a, b) {
    return activityTime(b) - activityTime(a);
}

export function registerCollections(eleventyConfig) {

    // 所有已发布的文章
    eleventyConfig.addCollection("posts", function (collectionApi) {
        return publishedPosts(collectionApi);
    });

    // 按更新时间倒序排列的文章
    eleventyConfig.addCollection("postsByDate", function (collectionApi) {
        return publishedPosts(collectionApi).sort(byActivityDesc);
    });

    // 首页精选：最近 2 篇 + 所有带 emotag 的文章，合并去重后按更新时间取前 5 篇
    eleventyConfig.addCollection("homePosts", function (collectionApi) {
        const sorted = publishedPosts(collectionApi).sort(byActivityDesc);
        const recent = sorted.slice(0, 2);
        const emotagged = sorted.filter((post) => Boolean(post.data.emotag));
        const unique = new Map();

        for (const post of [...recent, ...emotagged]) {
            unique.set(post.inputPath || post.url, post);
        }

        return [...unique.values()].sort(byActivityDesc).slice(0, 5);
    });
}
