---
layout: post
published: true
comment: true
permalink: 
title: jekyll的时区设置
tags: jekyll timezone
date: 2016-03-24 01:02:54 +0800
---
jekyll里的时区设置不好很麻烦，我就载了个大跟头。

因为时差的关系，要么url会变，要么post会消失，  
更夸张的是，在自己电脑上和上传以后结果不一样。  

所以，为了从这堆时区的破事中解放出来，建议如下：
<!--more-->

- _config.yml中添加`timezone: Europe/Amsterdam`与github保持一致  
- post文件中添加date项，且把格式写全，比如`date: 2016-03-24 01:02:54 +0800`  
- _config.yml中的permalink不要用日期作名称，比如我的是/posts/:title  
- 因为没有日期作url，所以文件名不要起重复  

这样做的另一个好处是，文件会以精确到秒来排序，避免同一天发的文章顺序不对。


嫌创建post文件麻烦地话，[这个脚本](/posts/auto-create-post)可以帮忙。


> 注: <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>{:target="_blank"}
