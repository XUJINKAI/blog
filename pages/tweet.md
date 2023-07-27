---
permalink: /tweet
title: 微博客
comments: false
---

<div id="disqus_thread">
    <blockquote>第一次见有人拿disqus当微博用的，话说这和留言板有什么区别-_-|||</blockquote>
    <div class="loading"></div>
</div>

<script>
    var disqus_config = function () {
        this.page.url = '{{site.url}}{{page.url}}';
        this.page.identifier = '{{page.url}}';
    };

    (function () {
        var d = document, s = d.createElement('script');
        s.src = 'https://{{site.disqus}}.disqus.com/embed.js';
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
