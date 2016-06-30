---
layout: post
published: true
comment: true
sticky: true
permalink: 
title: 自动创建post文件的脚本
tags: jekyll bat
date: 2016-03-24 01:12:54 +0800
---
在网站的**根目录**创建bat文件，将以下内容复制进去即可。

运行以后，输入一个博文标题，就会自动建立md文件并打开了。  

<!--more-->

		@echo by XUJINKAI
		@echo Auto add a file to _post folder

		set /p title=Input new post's title: 
		set dt=%date:~,4%-%date:~5,2%-%date:~8,2%
		set time0=%time: =0%
		set hms=%time0:~,2%:%time0:~3,2%:%time0:~6,2%
		set file=%dt%-%title%.md
		set fpath="_posts/%file%"

		echo --->> %fpath%
		echo layout: post>> %fpath%
		echo published: true>> %fpath%
		echo comment: true>> %fpath%
		echo permalink: >> %fpath%
		echo title: %title%>> %fpath%
		echo tags: >> %fpath%
		echo date: %dt% %hms% +0800>> %fpath%
		echo --->> %fpath%
		echo ^<!--more--^>>> %fpath%

		cd _posts
		start "" "%file%"


如果电脑区域设置不同，日期格式不同，截取日期会出现问题。  
可以运行`echo %date%`查看本地日期，然后修改脚本相应位置。

另外，上网上找了一下，自动适应日期格式也是可以的，但略微复杂，没有必要。

此文件也上传到了仓库中，可以到[这里](https://github.com/XUJINKAI/XUJINKAI.github.io/blob/master/create_new_post.bat){:target="_blank"}下载最新的版本。
