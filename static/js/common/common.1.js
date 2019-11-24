/**
 * 适配店铺信息页面计算冲突的问题
 */

//页面计算问题
var base = 0;

function setRootSize() {
	//var deviceWidth = document.documentElement.clientWidth;
	var deviceWidth = plus.screen.resolutionHeight;
	if (deviceWidth > 750) {
		deviceWidth = 750;
	}
	base = deviceWidth / 7.5;
	document.documentElement.style.fontSize = deviceWidth / 7.5 + 'px';
	
	console.log(document.documentElement.style.fontSize);
}

document.addEventListener( "plusready", setRootSize(), false );

// setRootSize();
// 
// 
// window.addEventListener('resize', function() {
// 	setRootSize();
// }, false);

// $(document).ready(function() {
// 	setRootSize();
// });

$(function() {
	$("video").attr({
		"width": "100%",
		"height": "auto",
	})
});

//导航
function selNav(but, wrap, classname) {
	var _but = $("#" + but),
		_wrap = $("#" + wrap),
		_close = $(".close");
	_but.bind("touchstart click", function() {
		_wrap.addClass('sel');
		return false;
	});
	$(document).bind("touchstart click", function(event) {
		if (!$(event.target).hasClass(classname)) {
			_wrap.removeClass('sel');
		}
	});
}

// tab切换
function selTab(wrapid, menubut, item, flag, hitem) {
	var _wrap = $("#" + wrapid),
		_menu = _wrap.find("." + menubut),
		_item = _wrap.find("." + item);
	// console.log(_item.size());
	if (flag) {
		_wrap.height($(window).height() - flag * base)
		$('.' + hitem).height($(window).height() - flag * base)
	}
	_menu.bind("click", function() {
		var _index = $(this).index();
		_menu.removeClass('sel');
		_item.removeClass('sel');
		_menu.eq(_index).addClass('sel');
		_item.eq(_index).addClass('sel');
		return false;
	});
}

// 显示隐藏
function selShow(but, wrap) {
	var _but = $("#" + but),
		_wrap = $("#" + wrap),
		_close = _wrap.find(".close");
	_but.bind("click", function() {
		_wrap.addClass('sel');
	});
	_close.bind("click", function() {
		_wrap.removeClass('sel');
	});
}

function pubtabmenu(id, num) {
	var _obj = $("#" + id),
		_top = _obj.offset().top,
		_fs = parseInt(document.documentElement.style.fontSize),
		_flat = _fs * num;
	$(window).bind("scroll", function() {
		var _scrolltop = $(document).scrollTop();
		if (_scrolltop > _flat) {
			_obj.addClass('sel');
		} else {
			_obj.removeClass('sel');
		}
	})
}
