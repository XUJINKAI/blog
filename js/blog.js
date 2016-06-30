---
---
// localStorage
var web_setting = (function(){
	var prefix = '_setting_';
	var set = function(name, value){
		localStorage[prefix+name] = value;
	};
	var get = function(name, default_value){
		var value = eval('('+localStorage[prefix+name]+')');
		if(value==undefined) {
			return default_value;
		}
		return value;
	};
	return {
		set: set,
		get: get,
	};
})();
// 全局变量
var DEBUG = web_setting.get('debug', (window.location.hostname!='{{site.domain}}'));
var ANI_MULTI = web_setting.get('animate-speed', 1);
// 显示debug信息
var DEBUG_INFO = (function(window){
	var _debug_info_list = [];
	var max_debug_show_num = 50;
	var max_debug_record_num = 1000;
	var _color_error = '#D8000C';
	var _color_warning = '#9F6000';
	var _color_info = '#00529B';
	var SHOW_LEVEL = web_setting.get('debug-info-show-level', 5);
	var get_show_level = function() {
		return SHOW_LEVEL;
	}
	var set_show_level = function(level) {
		SHOW_LEVEL = level;
		web_setting.set('debug-info-show-level', level);
	}
	var add_raw = function(raw) {
		_debug_info_list.push(raw);
		_debug_info_list = _debug_info_list.slice(-max_debug_record_num);
	}
	var add_msg = function(msg, color, level){
		if(DEBUG) {
			var s_color = '';
			if(color) { s_color = " style='color:"+color+"'" ;}
			var s_level = '';
			if(level) { s_level = " data-level='"+level+"'" ;}
			add_raw('<p'+s_color+s_level+'>'+msg+'</p>');
		}
	}
	var get_html = function(level) {
		if(level!=undefined) {
			set_show_level(level);
		}
		if(SHOW_LEVEL <= 0) {
			return _debug_info_list.slice(-max_debug_show_num).join('');
		}
		var str = '';
		var count = 0;
		for (var i = _debug_info_list.length - 1; i >= 0; i--) {
			var s = _debug_info_list[i];
			var m = s.match(/data-level=['"](\d+)['"]/);
			if(m!=null) {
				if(eval(m[1])>=SHOW_LEVEL){
					str = s + str;
					count++;
					if(count>=max_debug_show_num) {
						return str;
					}
				}
			}
		}
		return str;
	}
	var ret = get_html;
	ret.add_raw = add_raw;
	ret.add_msg = add_msg;
	ret.get_show_level = get_show_level;
	ret.set_show_level = set_show_level;
	// debug log
	window.log = function(msg) {
		add_msg(msg); // level 0
		if(SHOW_LEVEL<=0) console.log(msg);
	};
	window.info = function(msg) {
		add_msg(msg, _color_info, 5);
		if(SHOW_LEVEL<=5) console.info(msg);
	};
	window.warning = function(msg) {
		add_msg('[Warning]: '+msg, _color_warning, 8);
		if(SHOW_LEVEL<=8) console.warn(msg);
	};
	window.error = function(msg) {
		add_msg('[ERROR]: '+msg, _color_error, 10);
		if(SHOW_LEVEL<=10) console.error(msg);
		throw('<[error] ERROR OCCURED>');
	};
	return ret;
})(window);
// ajax
$(document).ajaxComplete(function(event, xhr, settings) {
	_AJAX_XHR = xhr;
	_AJAX_SETTING = settings;
	var msg = 'AJAX_DATA: ' + settings.type + ", " + settings.url;
	if(DEBUG) {
		DEBUG_INFO.add_msg(msg, '#4F8A10', 5);
		console.log(msg);
	}
});
// onerror
// window.onerror = function(sMessage, sUrl, sLine){
// 	var msg = sMessage +" Location: " +sUrl+", line:"+sLine +"\n";
// 	error(msg);
// }
// Array.remove(value)
Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

// Callback class
var Callback = {
	createNew: function(name_list) {
		var ret = {};
		// ini
		var callback_list = {};
		for (var i = name_list.length - 1; i >= 0; i--) {
			callback_list[name_list[i]] = []
		}
		//
		ret.reset = function(name) {
			if(typeof(name)=='string') {
				callback_list[name] = [];
			}
			else {
				for (var idx in callback_list) {
					callback_list[idx] = [];
				}
			}
		};
		ret.evoke = function(name, parameter) {
			var pall = [];
			var cbl = callback_list[name];
			for (var i = cbl.length - 1; i >= 0; i--) {
				try{
					if(typeof(cbl[i])!=='function') {
						warning(callback_list);
						warning('[Callback::evoke] Not a function.');
					}
					pall.push(cbl[i](parameter));
				}
				catch(e) {
					warning(callback_list)
					error('[Callback::evoke] '+e);
				}
			}
			return Promise.all(pall).catch(error);
		};
		var add_func = function(name, func) {
			if(name in callback_list) {
				callback_list[name].push(func);
			}
			else {
				log(arguments.callee.caller.caller.toString());
				error("[Callback::bind] '"+name+"' not in callback list.")
			}
		};
		ret.bind = function(para1, para2) {
			if(typeof(para1)=='object') {
				for(var idx in para1) {
					add_func(idx, para1[idx])
				}
			}
			else if(typeof(para1)=='string' && typeof(para2)=='function') {
				add_func(para1, para2);
			}
			else if(typeof(para1)=='undefined') {
				return;
			}
			else {
				warning(para1);
				warning(para2);
				error('[Callback::bind] bad parameter.');
			}
		};
		return ret;
	}
};

// scroll listener
var scroll_listener = (function(){
	var scroll_listener = {};
	var rem_top = -1;
	var callback_name_list = ['scroll', 'scroll_up', 'scroll_down', 'scroll_top'];
	var callback_list = Callback.createNew(callback_name_list);
	var update_interval = 50;
	var evoke = callback_list.evoke;
	scroll_listener.bind = callback_list.bind;
	var acting = function(){
		var top = $(window).scrollTop();
		if(top != rem_top) {
			evoke('scroll', top);
			if(top > rem_top) {
				evoke('scroll_down', top);
			}
			else {
				evoke('scroll_up', top);
			}
			if(top <= 1) {
				evoke('scroll_top', top);
			}
			//
			rem_top = top;
		}
	};
	$(function(){
		$(window).scroll(function(event) {
			setTimeout(function(){
				acting();
			}, update_interval)
		});
	});
	return scroll_listener;
})();
// tag多选
var tag_pjax = (function(){
	var tag_pjax = function(selector, container) {
		$(selector).click(function(event) {
			tag_pjax.click_tag($(this), $(container));
		});
	};
	var post_list = false;
	var tag_pressed = [];
	// var target = false;
	var callback_name_list = ['tag_press', 'tag_popup', 'tag_clear', 'tag_changed', 'before', 'after'];
	var callback_list = Callback.createNew(callback_name_list);
	var evoke = callback_list.evoke;
	tag_pjax.bind = callback_list.bind;
	tag_pjax.reset = function(){
		log('[tag_pjax::reset]');
		tag_pressed = [];
		callback_list.reset();
	}
	tag_pjax.isempty = function() {
		return tag_pressed.length == 0;
	};
	var get_post_list = function() {
		return new Promise(function(resolve, reject){
			if(post_list) {
				resolve();
			}
			else {
				$.ajax({
					type : "get",
					url : "/tag-list-json",
					async : false,
						success : function(data){
							post_list = eval('('+data+')');
							resolve();
						}
				});
			}
		})
	};
	var fresh_html = function(target) {
		var show_list = [];
		for (var j = post_list.length - 1; j >= 0; j--) {
			var item = post_list[j];
			var flag = true;
			for (var i = tag_pressed.length - 1; i >= 0; i--) {
				t = tag_pressed[i];
				if($.inArray(t, item['tags']) < 0) {
					flag = false;
				}
			}
			if(flag) {show_list.push(item);}
		}
		var h = 'tags: ';
		for (var i = 0; i <= tag_pressed.length - 1; i++) {
			h += tag_pressed[i];
			if(i < tag_pressed.length - 1) { h+=", "; }
		}
		for (var i = show_list.length - 1; i >= 0; i--) {
			var item = show_list[i];
			h += "<h2><a href='"+item['link']+"'>"+item['title']+"</a></h2>";
		}
		target.html(h);
	};
	tag_pjax.click_tag = function(taga, target){
		var tagt = taga.data('tag');
		// 先修改tag列表，因为在before和after里都要用到
		if($.inArray(tagt, tag_pressed) >= 0) {
			tag_pressed.remove(tagt);
			evoke('tag_popup', taga);
		}
		else {
			tag_pressed.push(tagt);
			evoke('tag_press', taga);
		}
		evoke('tag_changed');
		if(tag_pressed.length==0) {
			evoke('tag_clear');
		}
		get_post_list()
		.then(function(){
			return evoke('before');
		})
		.then(function(){
			fresh_html(target);
		})
		.then(function(){
			return evoke('after');
		})
		.catch(error);
	};
	tag_pjax.clear_tags = function() {
		tag_pressed = [];
		return evoke('tag_changed').then(function(){
			return evoke('tag_clear');
		});
	};
	tag_pjax.pressed_tag = function(){
		return tag_pressed;
	}
	tag_pjax.get_post_list = get_post_list;
	return tag_pjax;
})();

// 静态网页无刷新
var static_pjax = (function(){
	var callback_name_list = ['before', 'after'];
	var global_callback = Callback.createNew(callback_name_list);
	var static_pjax = function(selector, container, bind_dict){
		var local_callback = Callback.createNew(callback_name_list);
		local_callback.bind(bind_dict);
		log('[static_pjax::bind] '+selector);
		$(selector).click(function(event) {
			event.preventDefault();
			var url = $(this).attr('href');
			window.history.pushState('', '', url);
			info('--------------- window: pushState ---------------');
			log('[static_pjax] local_callback.before');
			local_callback.evoke('before')
				.then(function() {
					log('[static_pjax] on_url_change');
					return on_url_change(url, container);
				})
				.then(function() {
					log('[static_pjax] local_callback.after');
					return local_callback.evoke('after');
				})
				.catch(error);;
		});
	};
	var on_url_change = function(url, container) {
		return new Promise(function(resolve0, reject0){
			Promise.all([
				new Promise(function(resolve, reject){
						log('[static_pjax::on_url_change] $.get('+url+')');
						// Pace.track(function(){
						$.ajax({
							type: 'GET',
							url: url,
							error: function(xhr, ajaxOptions, throwError){
								reject(xhr.responseText);
							},
							success: function(html) {
								resolve(html);
							},
							xhr: function() {
								var xhr = new window.XMLHttpRequest();
								// pace.js
						        // xhr.addEventListener("progress", function (evt) {
						        //     if (evt.lengthComputable) {
						        //         var percentComplete = evt.loaded / evt.total;
						        //     }
						        // }, false);
						        return xhr;
							}
						});
						// })
					}),
				global_callback.evoke('before'),
				])
				.then(function(array){
					return new Promise(function(resolve, reject){
						log('[static_pjax::on_url_change] set html content');
						var html = array[0];
						var div = document.createElement('div');
						div.innerHTML = html;
						$(container).html(div.querySelector(container).innerHTML);
						document.title = div.querySelector('title').text;
						resolve();
					})
				})
				.then(function(){
					return global_callback.evoke('after');
				})
				.then(resolve0)
				.catch(error);
		});
	}
	static_pjax.on_url_change = on_url_change;
	static_pjax.global_bind = global_callback.bind;
	return static_pjax;
})();
