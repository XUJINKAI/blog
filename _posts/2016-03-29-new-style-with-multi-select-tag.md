---
layout: post
published: true
comment: true
sticky: false
permalink: 
title: 新的网站风格，和可以多选的tags
tags: 网站
date: 2016-03-29 20:23:22 +0800
---
这次网站主要在这么几个地方有变化：  
外观方面加了一个大长条，并且把页面变窄；  
去掉recent post和博文页面的边栏，把archives和tags合并到posts，添加了一个sticky置顶边栏；  
tags多选，并且是动态显示结果。  
<!--more-->

<br>
tags多选，相关代码在[_includes/tags.html](https://github.com/XUJINKAI/XUJINKAI.github.io/blob/master/_includes/tags.html){:target="_blank"}，[js/blog.js](https://github.com/XUJINKAI/XUJINKAI.github.io/blob/master/js/blog.js){:target="_blank"}，[tag-list-json.html](https://github.com/XUJINKAI/XUJINKAI.github.io/blob/master/tag-list-json.html){:target="_blank"}中。

主要思路就是预先通过tag-list-json.html打印出所有博文的title, url, 和tags, 再通过ajax读取，动态显示。

<br>
目前网站的缺点是：  
颜色搭配不好，因为不懂配色，所以选择了保险的黑白灰；  
导航栏置顶的效果也被我去掉了，以后有需要再加；

<br>
这次主要借鉴了两个网站：<http://note.rpsh.net/>{:target="_blank"}，<https://googleblog.blogspot.com/>{:target="_blank"}。

<br>
以下为存档:<br>
<https://jekyllrb.com/docs/home/>{:target="_blank"}<br>
<http://kramdown.gettalong.org/syntax.html>{:target="_blank"}<br>
