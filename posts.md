---
layout: frame
permalink: /posts/
title: 博文列表
---
<style type="text/css">
	.sticky h4 {
		font-size: 26px;
	}
	.sticky {
		font-size: 18px;
		margin-top: 35px;
		margin-bottom: 35px;
	}
	#posts-archive-list li {
		font-size: 18px;
	}
	#posts-archive-list li .disqus-comment-count{
		font-size: .8em;
	}
	.posts-content {
		line-height: 1.9;
	}
</style>
<div>
<ul class="list-unstyled" id="posts-archive-list">
    {% for post in site.posts %}
		{% capture year %} {{ post.date | date: '%Y' }} {% endcapture %}
		{% capture nyear %} {{ post.next.date | date: '%Y' }} {% endcapture %}
		{% if year != nyear %}
	    	<h2>{{ post.date | date: '%Y' }}</h2>
	    {% endif %}
    	<li>
    		<span>{{ post.date | date:"%Y-%m-%d" }}</span>
    		<span>&nbsp;&raquo;&nbsp;</span>
    		<a href="{{ post.url }}">{{ post.title }}</a>
    		<span class="disqus-comment-count" data-disqus-identifier="{{post.url}}"></span>
    	</li>
	{% endfor %} 
</ul>
</div>
<script id="dsq-count-scr" src="//xujinkai.disqus.com/count.js" async></script>