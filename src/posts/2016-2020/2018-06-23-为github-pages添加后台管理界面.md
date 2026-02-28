---
permalink: /posts/netlify-as-github-pages-cms
title: 为Github Pages添加后台管理界面
tags: 博客折腾
date: 2018-06-23 13:33:56 +08:00
---
GitHub Pages哪儿都好，就是没有后台管理（因为是静态博客嘛），每次需要本地写markdown然后push，很是繁琐。

一个办法是去github仓库直接修改提交，但还是不太方便。

有一些博客利用issue或gist，用单页应用读取，这样有两个问题，一是SEO，二是你现有文件必须搬家或改造，你还必须用别人提供好的模板。

有没有办法在保留现有主页的同时，添加一个管理后台呢？

搜索关键词“Jekyll CMS”，试了一大堆，终于被我找到了答案。

就是[netlify-cms](https://github.com/netlify/netlify-cms)，[官方Demo](https://cms-demo.netlify.com/#/collections/posts)。

## 优点

- 改造简单，甚至不能说是改造，只要在仓库添加一个admin文件夹，里边放两个文件就行了。

- 后台可定制化，/admin/config.yml这个文件里可以详细定制管理页面。因为jekyll博客每个人的meta data都可能是不一样的，所以可以自定义这些字段就很重要。

## 步骤

以下步骤，能在本地完成的你可以先在本地做，最后再push，因为配置config.yml文件以后在本地刷新实验效果比较方便。配置config文件参考文末链接。

- 打开我仓库里的[admin文件夹](https://github.com/XUJINKAI/XUJINKAI.github.io/tree/master/admin)，保存下来，按照你自己的需求编辑，然后放到自己的仓库。

- 进入 [https://app.netlify.com/](https://app.netlify.com/)，创建一个新应用，关联Github仓库。**Build Command**输入`jekyll build`，**Publish Directory**输入`_site`。

- 进入应用后，Custom Domain输入你主页的域名，他会提示你DNS配置有问题（因为你用的是Github的DNS），不用管他。（这步必须有，不然你从你主页还登陆不了）

- 去[Github OAuth页面](https://github.com/settings/developers)，新建一个app，callback网址填 https://api.netlify.com/auth/done ，其他随便。获取Client ID和Secret。再到Netlify/Settings/Access Control/OAuth，把ID和Secret填进去。

基本配置的步骤就是这样，我还做了一些额外的事情，所以如果你完成上述步骤后遇到了坑，接着往下看。

Netlify自己是提供服务器的，他会编译你关联的Github仓库，这就造成两个问题，一是你的博客变成了两份（逼死强迫症），二是你会发现缺少Gemfile和Gemfile.lock，然后netlify编译各种报错。（但是添加这两个文件后我本地jekyll就运行错误了）

- 我的办法是再弄一个[branch](https://github.com/XUJINKAI/XUJINKAI.github.io/tree/netlify)，专门给netlify编译（settings/deploy/Production branch可以设置编译分支），里边最主要的就是Gemfile、Gemfile.lock、index.html三个文件，index.html跳转到主页就行了。这样你本来的master分支还跟原来一样。

此外，config文件里可以配置登陆方式，我用的是Github OAuth方式，优点是你只要登陆GitHub就能进后台，而默认的方式需要登陆netlify。我netlify是用GitHub绑定的，然后因为没有注册邮箱还登陆失败了。所以推荐OAuth方式，方便且事儿少。

到此，就完成了。

## 链接

Netlify后台：[https://app.netlify.com/](https://app.netlify.com/)

Config配置文档：[https://www.netlifycms.org/docs/intro/](https://www.netlifycms.org/docs/intro/)
