(function () {
    "use strict";

    var defaults = {
        tag: null,
        sort: "update",
        order: "desc",
        emoji: false,
    };

    var state = {
        posts: [],
        query: { ...defaults },
    };

    function init() {
        var list = document.querySelector("ul.post-list");
        if (!list) return;

        state.posts = Array.from(list.querySelectorAll(":scope > li")).map(readPost);

        bindControls();
        addDateTooltips();
        addDisqusCounts();
        applyUrlState(false);

        window.addEventListener("popstate", function () {
            applyUrlState(false);
        });
    }

    function readPost(item) {
        var tags = Array.from(item.querySelectorAll("tags tag"), function (tag) {
            return tag.textContent.trim();
        });

        return {
            item: item,
            url: item.querySelector("a").getAttribute("href"),
            date: item.getAttribute("date") || "",
            update: item.getAttribute("update") || item.getAttribute("date") || "",
            tags: tags,
            emotag: item.querySelector("h3 emotag")?.textContent.trim() || "",
        };
    }

    function bindControls() {
        document.querySelectorAll(".post-sort-button").forEach(function (control) {
            control.addEventListener("click", function (event) {
                event.preventDefault();
                var sort = control.dataset.sort;

                if (state.query.sort === sort) {
                    state.query.order = state.query.order === "asc" ? "desc" : "asc";
                } else {
                    state.query.sort = sort;
                    state.query.order = "desc";
                }

                commitState();
            });
        });

        var emojiControl = document.querySelector(".post-filter-emoji");
        emojiControl?.addEventListener("click", function (event) {
            event.preventDefault();
            state.query.emoji = !state.query.emoji;
            commitState();
        });

        document.querySelectorAll(".tags-list a[data-tag]").forEach(function (control) {
            control.addEventListener("click", function (event) {
                event.preventDefault();
                var tag = control.dataset.tag;
                state.query.tag = state.query.tag === tag ? null : tag;
                commitState();
            });
        });
    }

    function applyUrlState(push) {
        var params = new URLSearchParams(window.location.search);
        var sort = params.get("sort");
        var order = params.get("order");

        state.query = {
            tag: params.get("tag") || null,
            sort: sort === "date" || sort === "update" ? sort : defaults.sort,
            order: order === "asc" || order === "desc" ? order : defaults.order,
            emoji: params.get("emoji") === "true",
        };

        if (push) updateUrl();
        render();
    }

    function commitState() {
        updateUrl();
        render();
    }

    function updateUrl() {
        var params = new URLSearchParams();

        if (state.query.tag) params.set("tag", state.query.tag);
        if (state.query.sort !== defaults.sort) params.set("sort", state.query.sort);
        if (state.query.order !== defaults.order) params.set("order", state.query.order);
        if (state.query.emoji) params.set("emoji", "true");

        var query = params.toString();
        history.pushState(null, "", "/posts/" + (query ? "?" + query : ""));
    }

    function render() {
        renderControls();
        renderPosts();
    }

    function renderControls() {
        document.querySelectorAll(".post-sort-button").forEach(function (control) {
            var active = control.dataset.sort === state.query.sort;
            control.classList.toggle("active", active);

            var sign = control.querySelector(".post-sort-sign");
            if (sign) sign.textContent = active
                ? (state.query.order === "asc" ? "▲" : "▼")
                : "";
        });

        document.querySelector(".post-filter-emoji")
            ?.classList.toggle("active", state.query.emoji);

        document.querySelectorAll(".tags-list a[data-tag]").forEach(function (control) {
            control.classList.toggle("active", control.dataset.tag === state.query.tag);
        });
    }

    function renderPosts() {
        var list = document.querySelector("ul.post-list");
        var posts = state.posts.slice().sort(comparePosts);

        posts.forEach(function (post) {
            var tagMatches = !state.query.tag || post.tags.includes(state.query.tag);
            var emojiMatches = !state.query.emoji || Boolean(post.emotag);
            post.item.hidden = !(tagMatches && emojiMatches);

            var date = post.item.querySelector("date");
            if (date) date.textContent = post[state.query.sort].substring(0, 10);

            list.appendChild(post.item);
        });
    }

    function comparePosts(left, right) {
        var a = left[state.query.sort];
        var b = right[state.query.sort];

        if (a === b) return 0;
        if (state.query.order === "asc") return a < b ? -1 : 1;
        return a > b ? -1 : 1;
    }

    function addDateTooltips() {
        state.posts.forEach(function (post) {
            var title = "创建于" + post.date.substring(0, 10);
            if (post.update && post.update !== post.date) {
                title += ", 更新于" + post.update.substring(0, 10);
            }

            var date = post.item.querySelector("date");
            if (date) date.title = title;
        });
    }

    function addDisqusCounts() {
        if (!window.SITE_CONFIG?.disqus) return;

        state.posts.forEach(function (post) {
            var meta = post.item.querySelector("pmeta");
            if (!meta) return;

            var count = document.createElement("span");
            count.className = "disqus-comment-count";
            count.dataset.disqusIdentifier = post.url;
            meta.appendChild(count);
        });

        var script = document.createElement("script");
        script.async = true;
        script.id = "dsq-count-scr";
        script.src = "//" + window.SITE_CONFIG.disqus + ".disqus.com/count.js";
        document.head.appendChild(script);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
