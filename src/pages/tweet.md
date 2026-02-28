---
permalink: /tweet
layout: layouts/page.njk
title: 微博客
comments: false
---

> 此页面的评论已开启审查（可以在这里私信我）

<div id="disqus_thread">
    <blockquote>未曾设想的disqus使用方式😏</blockquote>
    <div class="loading"></div>
</div>

<script>
    var disqus_config = function () {
        this.page.url = '{{ site.url }}{{ cleanUrl or page.url }}';
        this.page.identifier = '{{ cleanUrl or page.url }}';
    };

    (function () {
        var d = document, s = d.createElement('script');
        s.src = 'https://{{ site.integrations.disqus }}.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
</script>

<style>
    .loading {
        width: 50px;
        height: 50px;
        border: 2px solid #000;
        border-top-color: transparent;
        border-radius: 100%;
        animation: circle infinite 0.75s linear;
        margin: 0 auto;
        margin-top: 40px;
    }

    @keyframes circle {
        0% {
            transform: rotate(0);
        }

        100% {
            transform: rotate(360deg);
        }
    }
</style>
