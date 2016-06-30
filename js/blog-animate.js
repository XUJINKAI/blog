var nav = (function(){
	var nav = {};
	var header_index_height = 256;
	var header_shrink_height = 50;
	var bool_navbar_scroll_show = false;
	nav.should_big_header = function() {
		return (window.location.pathname=='/') || (window.location.pathname.substr(0,6)=='/page/');
	};
	// main content container
	nav.main_out = function() {
		return new Promise(function(resolve, reject){
			$('#frame-main-content').fadeOut(200*ANI_MULTI, function(){
				log('[nav::main_out]');
				resolve();
			});
		});
	};
	nav.main_in = function() {
		return new Promise(function(resolve, reject) {
			$('#frame-main-content').fadeIn(130*ANI_MULTI, function(){
				log('[nav::main_in]');
				resolve();
			});
		});
	};
	// header height
	nav.header_height_auto = function() {
		return new Promise(function(resolve, reject) {
			var header_height;
			if(nav.should_big_header()) {
				header_height = header_index_height;
			}
			else {
				header_height = header_shrink_height;
			}
			$('.header-outer').animate({
	    		height: header_height+'px'
	    	}, 500*ANI_MULTI, function() {
				resolve();
	    	});
	    });
	};
	// header inner (big title)
	nav.header_inner_out = function(immediately) {
		return new Promise(function(resolve, reject){
			if(immediately==true) {
				$('.header-inner').css('display', 'none');
				resolve();
			}
			else {
				$('.header-inner').fadeOut(600*ANI_MULTI, resolve);
			}
		});
	};
	nav.header_inner_in = function(immediately) {
		return new Promise(function(resolve, reject){
			if(immediately==true) {
				$('.header-inner').css('display', 'block');
				resolve();
			}
			else {
				$('.header-inner').fadeIn(600*ANI_MULTI, resolve);
			}
		});
	};
    nav.header_inner_auto = function(args) {
    	return new Promise(function(resolve, reject) {
    		if(typeof(args)=='object') {
	    		var force = args[0];
	    		var immediately = args[1];
    		}
    		else {
	    		var force = args;
	    		var immediately = null;
    		}
    		log('[nav::header_inner_auto] '+force+', '+immediately);
    		if(force===true) {
    			nav.header_inner_in(immediately).then(resolve);
    		}
    		else if(force===false) {
    			nav.header_inner_out(immediately).then(resolve);
    		}
    		else if(nav.should_big_header()) {
	    		nav.header_inner_in(immediately).then(resolve);
	    	}
	    	else {
	    		nav.header_inner_out(immediately).then(resolve);
	    	}
	    });
    };
	//navbar brand (small site title)
	nav.navbar_brand_out = function(immediately) {
		return new Promise(function(resolve, reject){
			if(immediately) {
				$('.navbar-brand').css('display', 'none');
			}
			else {
				$('.navbar-brand').fadeOut(400*ANI_MULTI, resolve);
			}
		});
	};
	nav.navbar_brand_in = function(immediately) {
		return new Promise(function(resolve, reject){
			if(immediately) {
				$('.navbar-brand').css('display', 'block');
			}
			else {
				$('.navbar-brand').fadeIn(400*ANI_MULTI, resolve);
			}
		});
	};
    nav.navbar_brand_auto = function(args) {
    	return new Promise(function(resolve, reject) {
    		if(typeof(args)=='object') {
	    		var force = args[0];
	    		var immediately = args[1];
    		}
    		else {
	    		var force = args;
	    		var immediately = null;
    		}
    		if(force===true) {
    			nav.navbar_brand_in(immediately).then(resolve);
    		}
    		else if(force===false) {
    			nav.navbar_brand_out(immediately).then(resolve);
    		}
    		else if(nav.should_big_header()) {
	    		nav.navbar_brand_out(immediately).then(resolve);
	    	}
	    	else {
	    		nav.navbar_brand_in(immediately).then(resolve);
	    	}
	    });
    };
    // scroll
    var _last_nav_show = null;
	nav.on_scroll = function(isdown) {
		var header_region = window.scrollY <= $('.header-outer').height();
    	if(header_region) {
    		nav.top_look();
    	}
    	else if(isdown){
    		// nothing
    	}
    	else {
    		nav.scroll_look();
    	}
    	var nav_show = !isdown;
    	if(!header_region && (nav_show!=_last_nav_show)) {
	    	$('.navbar').stop();
	    	_last_nav_show = nav_show;
	    	if(nav_show) {
	    		$('.navbar').animate({top: '0px'}, 300*ANI_MULTI);
	    	}
	    	else {
	    		$('.navbar').animate({top: '-50px'}, 300*ANI_MULTI);
	    	}
    	}
	};
	nav.scroll_look = function() {
		nav.navbar_brand_auto([true, true]);
    	$('.navbar').css('position', 'fixed');
    	$('.navbar').css('background-color', 'rgba(1, 124, 185, 0.85)');
	};
	nav.top_look = function() {
    	$('.navbar').stop();
    	nav.navbar_brand_auto(['', true]);
    	$('.navbar').css('position', 'absolute');
    	$('.navbar').css('background-color', 'rgba(255, 255, 255, 0)');
		$('.navbar').css('top', '0px');
	};
	//
	nav.collapse = function() {
		if($('nav .collapse').attr('aria-expanded')=='true') {
			$("button[data-toggle='collapse']").click();
		}
	};
	//
	var go_top_not_scroll_show = false;
	nav.go_top = function(immediately){
		return new Promise(function(resolve, reject){
			log('[nav::go_top]');
			if(immediately) {
				$('html, body').scrollTop(0);
				resolve();
			}
			go_top_not_scroll_show = true;
			$('html, body').animate({scrollTop: 0}, 300*ANI_MULTI, function(){
				go_top_not_scroll_show = false;
				resolve();
			});
		});
	}
	return nav;
})();