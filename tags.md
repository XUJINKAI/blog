---
layout: frame
title: Tags
---
<style type="text/css">
	.tags {
		margin-top: 20px;
	}
	.tags h4 {
		font-size: 28px;
	}
	.tags .clear {
		font-size: 20px;
	}
	.tags-content a {
		font-size: 20px;
		line-height: 38px;
		color: gray;
	}
	.tag-results {
		margin-top: 20px;
		padding-left: 15px;
	}
</style>
<div class="container">
<div class="row">
	<div class="col-md-3 col-md-offset-2">
		{% include tags.html %}
	</div>
	<div class="col-md-7 tag-results">
	</div>
</div>
</div>
<script>
// 修改h4
$(".tags h4").html('Tags');
//
var tag_hash_change = function(){
	if(window.location.pathname.substr(0,5)=='/tags'){
		var str = tag_pjax.pressed_tag().join(",");
		var url = '#'+str;
		window.history.replaceState('','', url);
	}
};
$(function(){
	// 按hash点击
	var tagstr = window.location.hash.substr(1);
	var tagts = tagstr.split(',');
	for (var i = tagts.length - 1; i >= 0; i--) {
		$("a[data-tag='"+tagts[i]+"']").click();
	}
	// 修改hash
	tag_pjax.bind({
		tag_changed: tag_hash_change,
	});
	// 加载列表
	tag_pjax.get_post_list();
})
</script>