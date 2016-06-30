---
layout: frame
permalink: /posts/
title: POSTS
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
	.posts-content {
		line-height: 1.9;
	}
</style>
<div class="
    col-lg-8 col-lg-offset-2
    col-md-8 col-md-offset-2
    col-sm-12
    col-xs-12
    posts-content">
<div><h2><a href="/tags" id="posts-tags">Tags</a></h2></div>
{% include sticky.html %}
<ul class="list-unstyled" id="posts-archive-list">
    {% for post in site.posts %}
		{% capture year %} {{ post.date | date: '%Y' }} {% endcapture %}
		{% capture nyear %} {{ post.next.date | date: '%Y' }} {% endcapture %}
		{% if year != nyear %}
	    	<h2>{{ post.date | date: '%Y' }}</h2>
	    {% endif %}
    	<li><span>{{ post.date | date:"%Y-%m-%d" }}</span>&nbsp;&raquo;&nbsp;<a href="{{ post.url }}">{{ post.title }}</a></li>
	{% endfor %} 
</ul>
</div>
<script>
$('.sticky h4').html('Sticky');
$(function(){
	static_pjax(".posts-content #posts-tags", "#frame-main-content");
	static_pjax(".posts-content #posts-archive-list a", "#frame-main-content");
});
</script>