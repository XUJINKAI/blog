/* Window, document */
function isEmpty(obj) {
    return obj === null || obj === undefined || obj === "";
}
function getUrlQueryVariable(variable, defaultValue) {
    var searchParams = new URLSearchParams(window.location.search);
    var value = searchParams.get(variable);
    if (isEmpty(value)) { value = defaultValue; }
    return value;
};
function setUrlQueryVariable(url, key, value, defaultValue) {
    var searchParams = new URLSearchParams(url.split('?')[1]);
    if (isEmpty(value) || value === defaultValue) { searchParams.delete(key); }
    else { searchParams.set(key, value); }
    var newUrl = url.split('?')[0];
    var searchQuery = searchParams.toString();
    if (!isEmpty(searchQuery)) {
        newUrl = newUrl + "?" + searchQuery;
    }
    return newUrl;
};
function pushHistoryState(url) {
    history.pushState(null, '', url);
}
function listenHistoryState(fn) {
    window.addEventListener('popstate', function (event) {
        fn(event.state);
    });
}
function ready(fn) {
    if (document.readyState != 'loading') {
        fn(window);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            fn(window);
        });
    }
}

/* posts */
function getPostsList() {
    var postsList = [];
    var liList = document.querySelectorAll("ul.post-list li");
    liList.forEach(li => {
        var post = {};
        post.item = li;
        post.title = li.querySelector("a").innerHTML;
        post.url = li.querySelector("a").getAttribute("href");
        post.date = li.getAttribute("date");
        post.update = li.getAttribute("update") || post.date;
        post.tags = [];
        li.querySelectorAll("tags tag").forEach(tagDom => { post.tags.push(tagDom.innerHTML); });
        post.emotag = li.querySelector("h3 emotag")?.innerHTML;
        postsList.push(post);
    });
    return postsList;
}
function renderPostsList() {
    var postList = document.querySelector("ul.post-list");
    postList.innerHTML = "";
    postsState.posts
        .filter(post => {
            var isTag = isEmpty(postsQuery.tag) || post.tags.includes(postsQuery.tag);
            var isEmoji = postsQuery.filter_emoji && !isEmpty(post.emotag) || !postsQuery.filter_emoji;
            return isTag && isEmoji;
        })
        .sort((a, b) => {
            var textA = a[postsQuery.sort];
            var textB = b[postsQuery.sort];
            if (postsQuery.order == "asc") {
                return (textA < textB) ? -1 : 1;
            } else {
                return (textA > textB) ? -1 : 1;
            }
        })
        .forEach(post => {
            var item = post.item;
            item.querySelector("date").innerHTML = post[postsQuery.sort].substring(0, 10);
            postList.appendChild(item);
        });
}

/* tags */
function getTagsList(postsList) {
    var tagsList = [];
    postsList.forEach(post => {
        post.tags.forEach(tag => {
            if (tagsList.find(x => x.name === tag) == undefined) {
                var tagItem = {};
                tagItem.name = tag;
                tagItem.count = 1;
                tagItem.posts = [];
                tagItem.posts.push(post);
                tagItem.item = document.createElement("a");
                tagItem.item.href = "javascript:toggleTag('" + tagItem.name + "');";
                tagItem.item.innerHTML = `<span class="tag-name">${tagItem.name}</span><span class="tag-count">${tagItem.count}</span>`;
                tagsList.push(tagItem);
            } else {
                var existingTagItem = tagsList.find(x => x.name === tag);
                existingTagItem.count++;
                existingTagItem.item.querySelector("span.tag-count").innerHTML = existingTagItem.count;
                existingTagItem.posts.push(post);
            }
        });
    });
    return tagsList;
}
function renderTagsList() {
    var tagsList = document.querySelector(".tags-list");
    tagsList.innerHTML = "";
    postsState.tags.forEach(tag => {
        var item = tag.item;
        item.classList.remove("active");
        if (tag.name == postsQuery.tag) {
            item.classList.add("active");
        }
        tagsList.appendChild(item);
    });
}

/* API */
function renderPostsPage() {
    document.querySelectorAll(".post-sort-sign").forEach(span => {
        span.innerHTML = "";
        span.parentElement.classList.remove("active");
    });
    document.querySelector(`a[data-sort='${postsQuery.sort}'] .post-sort-sign`).innerHTML = postsQuery.order == "asc" ? "▲" : "▼";
    document.querySelector(`a[data-sort='${postsQuery.sort}']`).classList.add("active");

    document.querySelector('a.post-filter-emoji').classList.remove('active');
    if (postsQuery.filter_emoji) {
        document.querySelector('a.post-filter-emoji').classList.add('active');
    }

    renderTagsList();
    renderPostsList();
}
function renderPostsFromUrlQuery() {
    postsQuery.tag = getUrlQueryVariable("tag", defaultQuery.tag);
    postsQuery.sort = getUrlQueryVariable("sort", defaultQuery.sort);
    postsQuery.order = getUrlQueryVariable("order", defaultQuery.order);
    postsQuery.filter_emoji = getUrlQueryVariable("emoji", defaultQuery.filter_emoji);
    renderPostsPage();
}
function renderPostsWithUrl() {
    var url = window.location.href;
    url = setUrlQueryVariable(url, "tag", postsQuery.tag, defaultQuery.tag);
    url = setUrlQueryVariable(url, "sort", postsQuery.sort, defaultQuery.sort);
    url = setUrlQueryVariable(url, "order", postsQuery.order, defaultQuery.order);
    url = setUrlQueryVariable(url, "emoji", postsQuery.filter_emoji, defaultQuery.filter_emoji);
    pushHistoryState(url);
    renderPostsPage();
}
function toggleSort(sortBy) {
    if (postsQuery.sort == sortBy) {
        postsQuery.order = postsQuery.order == "asc" ? "desc" : "asc";
    } else {
        postsQuery.sort = sortBy;
        postsQuery.order = "desc";
    }
    renderPostsWithUrl();
}
function toggleTag(name) {
    postsQuery.tag = postsQuery.tag == name ? null : name;
    renderPostsWithUrl();
}
function toggleEmoji() {
    postsQuery.filter_emoji = !postsQuery.filter_emoji;
    renderPostsWithUrl();
}

/* onload */
var defaultQuery = {
    tag: null,
    sort: "update",
    order: "desc",
    filter_emoji: false,
};
var postsQuery = JSON.parse(JSON.stringify(defaultQuery));

var postsState = {
    posts: [],
    tags: [],
};

ready(function () {
    postsState.posts = getPostsList();
    postsState.tags = getTagsList(postsState.posts);

    postsState.posts.forEach(post => {
        var date = post.date.substring(0, 10);
        var title = `创建于${date}`;
        if (post.update && post.update != post.date) {
            var update = post.update.substring(0, 10);
            title += `, 更新于${update}`;
        }
        post.item.querySelector('date').title = title;
    });

    if (SITE_CONFIG.disqus != "") {
        postsState.posts.forEach(post => post.item.querySelector("pmeta").innerHTML += `<span class="disqus-comment-count" data-disqus-identifier="${post.url}"></span>`);
        var script = document.createElement("script");
        script.async = true;
        script.id = "dsq-count-scr";
        script.src = `//${SITE_CONFIG.disqus}.disqus.com/count.js`;
        document.head.appendChild(script);
    }

    renderPostsFromUrlQuery();
    listenHistoryState(function () {
        renderPostsFromUrlQuery();
    });
});
