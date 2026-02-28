---
permalink: /posts/docker-aria2-with-webui
title: 下载神器aria2及其Docker镜像制作
tags: 个人项目
date: 2016-12-14 00:26:44 +08:00
---
前一阵子买了群晖NAS，然后发现了docker这个神器。

在群晖里装了docker版的gitlab，又不满群晖自带的下载软件太烂，发现了aria2这个下载神器。

aria2正常安装应该也不太复杂，其实下载下来运行就行。webui就是个html，用浏览器就能直接打开。不过在群晖中，直接折腾系统总是让人不放心，毕竟是文件大总管，弄坏了有的纠结（事实上我前几天正好就坏了硬盘，连带着群晖系统差点完蛋，简直崩溃）。就想到可以把aria2连带webui打包成一个docker镜像。

过程并不复杂，最终写好的文件在这里<a href="https://github.com/XUJINKAI/aria2-with-webui" target="_blank">https://github.com/XUJINKAI/aria2-with-webui</a>。

此Docker也传到了<a href="https://hub.docker.com/r/xujinkai/aria2-with-webui/" target="_blank">https://hub.docker.com/r/xujinkai/aria2-with-webui/</a>，你可以通过`docker pull xujinkai/aria2-with-webui`获取。

#### 制作过程中关键的点记录如下：

1. 镜像基于alpine，可以有效减小体积。ubuntu的`apt-get`命令在alpine中是`apk`命令。

2. 因为用不到php之类的语言，就使用小巧的darkhttpd作为静态网页服务器。

3. 使用/conf文件夹保存配置文件，/data文件夹保存下载文件，方便使用。

4. 在aria2.conf中设置`on-download-complete`参数，再通过on-download-complete.sh文件把下载好的文件从/data/_dl移动到/data，方便管理。目前的问题是，如果下载bt文件，一个文件夹里有多个文件，on-download-complete.sh只会移动其中一个，因为aria2传过去的参数`$3`就只是其中一个文件名，要做到移动文件夹的话，得多写代码判断。

5. 为了让挂载出来的/conf文件夹有默认的配置文件，配置文件在制作镜像时是先拷贝到/conf-copy中的，然后在运行时再拷到/conf里。

另外，配合aria2，推荐https://github.com/acgotaku/BaiduExporter和https://github.com/acgotaku/YAAW-for-Chrome两个chrome插件。

多吐槽一句百度，之前限速20kb，忍无可忍买了个超级会员，速度就10M了。。。
