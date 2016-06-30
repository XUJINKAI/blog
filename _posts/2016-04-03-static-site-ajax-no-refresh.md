---
layout: post
published: true
comment: true
sticky: false
permalink: 
title: 静态网站的无刷新尝试
tags: ajax 网站
date: 2016-04-03 07:53:57 +0800
---
试着把整个网站改成了无刷新的效果，以下是一些记录和心得。

因为是静态网站，没有后台支持，所以思路就是ajax先获取整个页面，然后再局部替换。

页面替换后，页面中的script脚本也会重新运行，所以组织页面之间的结构就非常重要。

另外，我还加入了页面过渡效果，为了更好的组织动画先后次序和回调，需要用到promise。

在整个修改的过程中，经常会遇到有的代码运行多次或者不运行的情况，整个debug过程需要一定的技巧和耐心。

<!--more-->
<br>

#### **代码一定要组织好**

因为整个网站变成一个整体，所以相当于同时管理的代码量增多好几倍。  

又由于代码运行的效果不会因为url变化而消失，就要转变思路，网页与网页之间不再是独立不相关的，而要从一个整体来看待整个网站，有点类似做应用的感觉。

同时，网站的代码会自然地分成两种：

1. 替换部分之外的代码只会执行一次，执行后的效果也会一直存在；  

2. ajax动态替换的部分，每次替换后，会执行一次。同时，新替换的网页元素中的绑定是没有的，需要重新绑定。

基于这两点，建议就是：

class(闭包实现)可以在公共部分实现，只执行一次就好，但如果class是有状态的，要写好reset函数。 

在动态替换的部分，如果需要绑定，绑定的代码也要写在一起；如果要用到class，先reset一下清除之前网页留下的状态。

> 在这里我就遇到一个坑，我用来管理tag多选的class在公共部分，在[主页](/)和[tags页面](/tags)都有调用，这个class里既记录了当前按下的tag列表，也维护了一个callback列表。  
> 刚开始在两个页面之间切换总会互相影响，甚至callback列表内容只赠不减，造成同一个页面刷新好多次。  
> 后来搞定，只要在class中加一个reset函数，清空tag列表和callback列表，然后在tag页面开头执行这个reset就好了。


<br>

#### **浏览器状态更新**

history.pushState和replaceState可以用来修改浏览器url，参数列表都是`('' ,'', url)`。

修改title要用`document.title = ''`。

使用js修改url后，浏览器的前进后退就失效了，要用`$(window).on("popstate", function)`手动实现。

> 我写了一个static_pjax来完成这个工作，要让某一个链接变成无刷新的效果，只要执行static_pjax('selector', 'container')就行了。  
> static_pjax.on_url_change(url, container) 是根据url改变container内容的函数。因为网站比较简单，所有链接的container都指向同一个，所以在onpopstate中，直接调用static_pjax.on_url_change，并且container可以写死。  
> 如果网页嵌套结构比较复杂，就可能会麻烦很多，需要在onpopstate中判断替换哪一部分网页。


<br>

#### **用Promise组织动画效果**

说是动画效果，实际上就是jQuery的animate和fadeOut/fadeIn实现的。难点在于动画先后顺序的调整，这部分没有promise的帮助应该会相当痛苦。

大多浏览器都支持Promise了，包括chrome和edge，万恶的IE不支持，其他浏览器未知。保险起见，可以把promise的polyfill文件加入，可以从[这里](https://github.com/taylorhakes/promise-polyfill)下载。

Promise的教程推荐这篇 <http://www.w3ctech.com/topic/721>{:target="_blank"}

promise刚开始使用总是出错，习惯以后非常方便。  

简单的总结如下：  
1. 要把普通函数写成promise的形式，就在函数里返回一个promise，promise里放一个函数，接收两个参数，函数里是具体代码。  
2. new Promise(function) 会立刻执行function，所以修改以后的函数仍然可以执行，只是返回结果变成了一个promise。  
3. 要拿到原来函数的返回结果，就把结果通过resolve传递下去，再在下一个then里获取。  
4. 函数里一定要resolve或者reject，否则链式调用就断了。  
5. then里边可以是function，也可以是其他东西，不过只有是function的时候才会依顺序执行（放其他东西就直接求值了）。  
6. 要在一个调用链中，给某一个函数传参，可以在之前加一个then把参数resolve进去，也可以给这个函数外边再套一层function。  
7. then里的function只能接收一个值，resolve里也只能放进去一个值。Promise.all里可以放一个array，下一个then里接收的参数就是这个array运行的结果。

> 我先实现了一个Callback类，用来创建和管理回调函数。再在需要回调列表的类里使用Callback来创建列表实例。  
> 需要动画效果时，就在回调列表里添加before和after两张表，然后由promise链式调用即可。  

补充，进阶教程：<http://www.tuicool.com/articles/FvyQ3a>{:target="_blank"}

<br>

#### **动态加载的模块要记得**

google analytics，如果有用到的话，要在每次url改变后告诉ga：

		if(ga) {
			ga('set', 'location', window.location.href);
			ga('send', 'pageview');
		}

多说评论:

在框架部分加载多说的embed.js，然后每次url改变后运行：

		DUOSHUO.EmbedThread($('.ds-thread'));

多说的相关文档<http://dev.duoshuo.com/docs/50b344447f32d30066000147>{:target="_blank"}
