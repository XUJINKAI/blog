var _debug = (function() {
	// 查找重复的元素id
	var dup_ids = function(){
		// Warning Duplicate IDs
		$('[id]').each(function(){
			var ids = $('[id="'+this.id+'"]');
			if(ids.length>1 && ids[0]==this) {
				warning('Multiple IDs: #'+this.id);
				for (var i = ids.length - 1; i >= 0; i--) {
					log(ids[i]);
				}
			}
		});
	}
	// ga增强的链接归因，保证每一个链接或向上3层都有id
	var ga_linkid = function(level){
		if(!level) {level=3;}
		var list_href1 = [];
		var list_href_more = [];
		var clear_list = [];
		$('a').each(function() {
			var same_href = $('a[href="'+$(this).attr('href')+'"]').length;
			// 略过href是javascript的元素
			if($(this).attr('href').substring(0, 11)=='javascript:'){return;}
			var p = this;
			var flag = false;
			for (var i = 1; i <= level; i++) {
				if(p.id.length>0) {
					flag = true;
					break;
				}
				else {
					p = p.parentElement;
				}
			}
			if(flag) {
				clear_list.push(this);
			}
			else {
				if(same_href==1) {
					list_href1.push(this);
				}
				else {
					list_href_more.push(this);
				}
			}
		});
		if(list_href1.length>0 || list_href_more.length>0) {
			warning('ga no linkid:');
			if(list_href1.length>0) {
				console.log('<once>');
				for (var i = list_href1.length - 1; i >= 0; i--) {
					console.log(list_href1[i])
				}
			}
			if(list_href_more.length>0) {
				warning('<more>');
				for (var i = list_href_more.length - 1; i >= 0; i--) {
					console.log(list_href_more[i])
				}
			}
		}
	}
	var _debug = function(){
		dup_ids();
		ga_linkid();
	}
	_debug.dup_ids = dup_ids;
	_debug.ga_linkid = ga_linkid;
	return _debug;
})();

// 运行一次
_debug();