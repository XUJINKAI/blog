---
permalink: /donate
layout: index
title: DONATE 捐赠
sitemap: false
comment: false
---
<!-- jQuery -->
<script src="/js/jquery-1.12.2.min.js"> </script>
<!-- Bootstrap -->
<link href="/css/bootstrap.min.css" rel="stylesheet"/>
<script src="/js/bootstrap.min.js"></script>

<style type="text/css">
img {
	max-width: 100%;;
	max-height: 300px;
}
.tab-pane img{
  border: 1px solid #d6d6d6;
}
</style>


<div class="row" style="max-width: 768px; margin-left: auto; margin-right: auto;">
<div style="height: 30px;"></div>
<a href="/" style="font-size: 24px; text-decoration: underline;">Back</a>
<h2>感谢你</h2>

<div class="tab-div">
<ul class="nav nav-tabs">
  <li><a data-toggle="tab" href="#alipay">支付宝</a></li>
  <li><a data-toggle="tab" href="#wechat">微信</a></li>
</ul>

<div class="tab-content">
  <div id="wechat" class="tab-pane fade">
    <img src="/img/wechat.png" alt="">
  </div>
  <div id="alipay" class="tab-pane fade">
  	<img src="/img/alipay.jpg" alt="">
    <br>
  </div>
</div>
</div>

</div>

<script>
$(".tab-div .nav li a")[0].click();
</script>