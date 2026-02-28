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
    var posts_list = [];
    var li_list = document.querySelectorAll("ul.post-list li");
    li_list.forEach(li => {
        var post = {};
        post.item = li;
        post.title = li.querySelector("a").innerHTML;
        post.url = li.querySelector("a").getAttribute("href");
        post.date = li.getAttribute("date");
        post.update = li.getAttribute("update") || post.date;
        post.tags = [];
        li.querySelectorAll("tags tag").forEach(tag_dom => { post.tags.push(tag_dom.innerHTML); });
        post.emotag = li.querySelector("h3 emotag")?.innerHTML;
        posts_list.push(post);
    });
    return posts_list;
}
function renderPostsList() {
    var postList = document.querySelector("ul.post-list");
    postList.innerHTML = "";
    homeObj.posts
        .filter(post => {
            var isTag = isEmpty(homeQuery.tag) || post.tags.includes(homeQuery.tag);
            var isEmoji = homeQuery.filter_emoji && !isEmpty(post.emotag) || !homeQuery.filter_emoji;
            return isTag && isEmoji;
        })
        .sort((a, b) => {
            var textA = a[homeQuery.sort];
            var textB = b[homeQuery.sort];
            if (homeQuery.order == "asc") {
                return (textA < textB) ? -1 : 1;
            } else {
                return (textA > textB) ? -1 : 1;
            }
        })
        .forEach(post => {
            var item = post.item;
            item.querySelector("date").innerHTML = post[homeQuery.sort].substring(0, 10);
            postList.appendChild(item);
        });
}
/* tags */
function getTagsList(postsList) {
    var tags_list = [];
    postsList.forEach(post => {
        post.tags.forEach(tag => {
            if (tags_list.find(x => x.name === tag) == undefined) {
                var tagItem = {};
                tagItem.name = tag;
                tagItem.count = 1;
                tagItem.posts = [];
                tagItem.posts.push(post);
                tagItem.item = document.createElement("a");
                tagItem.item.href = "javascript:toggleTag('" + tagItem.name + "');";
                tagItem.item.innerHTML = `<span class="tag-name">${tagItem.name}</span><span class="tag-count">${tagItem.count}</span>`;
                tags_list.push(tagItem);
            } else {
                var tagItem = tags_list.find(x => x.name === tag);
                tagItem.count++;
                tagItem.item.querySelector("span.tag-count").innerHTML = tagItem.count;
                tagItem.posts.push(post);
            }
        });
    });
    return tags_list;
}
function renderTagsList() {
    var tagsList = document.querySelector(".tags-list");
    tagsList.innerHTML = "";
    homeObj.tags.forEach(tag => {
        var item = tag.item;
        item.classList.remove("active");
        if (tag.name == homeQuery.tag) {
            item.classList.add("active");
        }
        tagsList.appendChild(item);
    });
}
/* API */
function homeRenderPage() {
    document.querySelectorAll(".post-sort-sign").forEach(span => {
        span.innerHTML = "";
        span.parentElement.classList.remove("active");
    });
    document.querySelector(`a[data-sort='${homeQuery.sort}'] .post-sort-sign`).innerHTML = homeQuery.order == "asc" ? "▲" : "▼";
    document.querySelector(`a[data-sort='${homeQuery.sort}']`).classList.add("active");

    document.querySelector('a.post-filter-emoji').classList.remove('active');
    if (homeQuery.filter_emoji) {
        document.querySelector('a.post-filter-emoji').classList.add('active');
    }

    renderTagsList();
    renderPostsList();
}
function homeRenderFromUrlQuery() {
    homeQuery.tag = getUrlQueryVariable("tag", defaultQuery.tag);
    homeQuery.sort = getUrlQueryVariable("sort", defaultQuery.sort);
    homeQuery.order = getUrlQueryVariable("order", defaultQuery.order);
    homeQuery.filter_emoji = getUrlQueryVariable("emoji", defaultQuery.filter_emoji);
    homeRenderPage();
}
function homeRenderIncludeUrl() {
    var url = window.location.href;
    url = setUrlQueryVariable(url, "tag", homeQuery.tag, defaultQuery.tag);
    url = setUrlQueryVariable(url, "sort", homeQuery.sort, defaultQuery.sort);
    url = setUrlQueryVariable(url, "order", homeQuery.order, defaultQuery.order);
    url = setUrlQueryVariable(url, "emoji", homeQuery.filter_emoji, defaultQuery.filter_emoji);
    pushHistoryState(url);
    homeRenderPage();
}
function toggleSort(sort_by) {
    if (homeQuery.sort == sort_by) {
        if (homeQuery.order == "asc") {
            homeQuery.order = "desc";
        } else {
            homeQuery.order = "asc";
        }
    } else {
        homeQuery.sort = sort_by;
        homeQuery.order = "desc";
    }
    homeRenderIncludeUrl();
}
function toggleTag(name) {
    if (homeQuery.tag == name) {
        homeQuery.tag = null;
    } else {
        homeQuery.tag = name;
    }
    homeRenderIncludeUrl();
}
function toggleEmoji() {
    homeQuery.filter_emoji = !homeQuery.filter_emoji;
    homeRenderIncludeUrl();
}
/* onload */
var defaultQuery = {
    tag: null,
    sort: "update",
    order: "desc",
    filter_emoji: false,
};
var homeQuery = JSON.parse(JSON.stringify(defaultQuery));

var homeObj = {
    posts: [],
    tags: [],
};
ready(function (window) {
    homeObj.posts = getPostsList();
    homeObj.tags = getTagsList(homeObj.posts);

    homeObj.posts.forEach(post => {
        var date = post.date.substring(0, 10);
        var title = `创建于${date}`;
        if (post.update && post.update != post.date) {
            var update = post.update.substring(0, 10);
            title += `, 更新于${update}`;
        }
        post.item.querySelector('date').title = title;
    });

    if (SITE_CONFIG.disqus != "") {
        homeObj.posts.forEach(post => post.item.querySelector("pmeta").innerHTML += `<span class="disqus-comment-count" data-disqus-identifier="${post.url}"></span>`);
        var script = document.createElement("script");
        script.async = true;
        script.id = "dsq-count-scr";
        script.src = `//${SITE_CONFIG.disqus}.disqus.com/count.js`;
        document.head.appendChild(script);
    }

    homeRenderFromUrlQuery();
    listenHistoryState(function (url) {
        homeRenderFromUrlQuery();
    });
});
