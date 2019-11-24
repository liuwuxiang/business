var storage = null;
//当前头部选中项
var currentChooseIndex = -1;
// 初始化mui 并且初始化下拉刷新组件
mui.init({
	pullRefresh: {
		container: '#slider',
		down: {
			style: 'circle',
			callback: pullupRefresh,
			auto: true, //可选,默认false.首次加载自动上拉刷新一次
		},
	}
});

mui.plusReady(function() {

	// 初始化加载
	mui.ready(function() {
		storage = window.localStorage;

		//mMain.gotoLogin();

		binding();

		// 模拟点击新订单
		var new_order = document.getElementById('new_order');
		mui.trigger(new_order, 'tap');
		initAd();

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			optionClick('0');
			mMain.selectBusinessLegalize();
		});
	});

});

// 下拉刷新操作事件
function pullupRefresh() {
	initAd();
	if(currentChooseIndex == -1) {
		optionClick('0');
	} else {
		optionClick(currentChooseIndex);
	}
	mui('.head').off('tap', '.scan');
	mui('.wrap').off('click', 'a');
	mui('.mui-slider-group').off('tap', '.mui-slider-item');
	binding();
	mui('#slider').pullRefresh().endPulldown();
}

// 事件绑定
function binding() {
	// 扫描按钮点击事件
	mui('.head').on('tap', '.scan', function() {
		plus.webview.close('scan.html');
		mui.openWindow({
			url: './scan.html',
			id: 'scan.html',
			styles: {
				top: '0px',
				bottom: '51px'
			},
			createNew: true,
			waiting: {
				autoShow: false,
			}
		});
	});

	// 绑定选项卡切换事件
	mui('.wrap').on('click', 'a', function() {
		var name = this.getAttribute('name');
		optionClick(name);
	});

	// 轮播点击事件
	mui('.mui-slider-group').on('tap', '.mui-slider-item', function() {
		var img_url = this.getAttribute('name');
		mui.openWindow({
			url: '/web/my/problem_show.html',
			id: 'problem_show.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			extras: {
				'type': '1',
				'img_url': img_url
			},
			createNew: true,
		});
	})

}

// 初始化广告
function initAd() {
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/selectGalleryChangYeDoingsSpreadById',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			$.hideLoading();
			var slider_list = $('#slider_list');
			if(data.status == 0 && data.data.length !== undefined) {
				slider_list.empty();
				var html =
					'<div class="mui-slider-item mui-slider-item-duplicate" name="' + data.data[data.data.length - 1].gallery_content_img +
					'" >' +
					'	<a href="#"><img src="' + data.data[data.data.length - 1].gallery_img + '" /></a>' +
					'</div>';
				slider_list.append(html);

				data.data.forEach(function(e) {
					var html =
						'<div class="mui-slider-item " name="' + e.gallery_content_img + '">' +
						'	<a href="#"><img src="' + e.gallery_img + '" /></a>' +
						'</div>';
					slider_list.append(html);
				});

				var html =
					'<div class="mui-slider-item mui-slider-item-duplicate" name="' + data.data[0].gallery_content_img + '">' +
					'	<a href="#"><img src="' + data.data[0].gallery_img + '" /></a>' +
					'</div>';
				slider_list.append(html);

				//获得slider插件对象
				var gallery = mui('.mui-slider');
				gallery.slider({
					interval: 1000
				});
			} else {
				$('.mui-slider').css('display', 'none');
			}
		}
	});

}

//选项切换事件(0-新订单,1-已完成订单,2-权益订单)
function optionClick(index) {
	currentChooseIndex = index;
	if(index == 0) {
		document.getElementById("new_order").setAttribute("class", "item sel");
		document.getElementById("finish_order").setAttribute("class", "item");
	} else if(index == 1) {
		document.getElementById("finish_order").setAttribute("class", "item sel");
		document.getElementById("new_order").setAttribute("class", "item");
	}
	getOrderData(index);
}

//获取权益订单数据
function getQuanYiOrderData() {
	toast(2, "打开loading");
	$("#order_in_progress_ul li").remove();
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getAllWnkQyOrder",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(data.status == 0) {
				var list = data.data.list;
				if(list.length <= 0) {
					toast(1, "暂无数据");
					return;
				}
				for(var index = 0; index < list.length; index++) {
					var obj = list[index];
					var guige_name = obj.guige_name;
					if(guige_name == undefined) {
						guige_name = "";
					}
					var html =
						"<li class=\"order_li\" id=" + obj.order_no + " name=" + type + ">      " +
						"	<div class=\"li_top_div\">                                          " +
						"		<a class=\"li_top_day_tag\" >" + obj.day + "        </a>        " +
						"		<a class=\"li_order_no_tag\">NO." + obj.order_no + "</a>        " +
						"	</div>                                                              " +
						"	<div class=\"li_commodites_div\">                                   " +
						"		<a class=\"commodities_number_tag\">基础信息</a>                 " +
						"	<div class=\"user_div\">                                            " +
						"		<a>会员名称：" + obj.user_name + "        </a>                   " +
						"		<a>卡片等级：" + obj.member_card_level + "</a>                   " +
						"		<a>商品名称：" + obj.commodity_name + "   </a>                   " +
						"		<a>使用次数：" + obj.make_number + "    次</a>                   " +
						"		<a>商品规格：" + guige_name + "           </a>                   " +
						"	</div>                                                              " +
						"	<div class=\"li_bottom_div\">                                       " +
						"		<a class=\"line_order_time\">" + obj.line_order_date_str + "</a>" +
						"		<a class=\"order_price_tag\">" + obj.state_str + "          </a>" +
						"	</div>                                                              " +
						"</li>";
					$("#order_in_progress_ul").append(html);
				}
				document.getElementById("top_people_static_tag").innerText = "消费人数：" + data.data.people_number + "人";
				document.getElementById("top_number_static_tag").innerText = "消费次数：" + data.data.make_number + "次";

			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
			}
		}
	});
}

//获取订单数据
function getOrderData(type) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v2.0.0/getAllOrder",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"type": type
		},
		success: function(data) {
			toast(3, "关闭loading");
			$("#order_in_progress_ul li").remove();
			if(data.status == 0) {
				var list = data.data.list;
				if(list.length <= 0) {
					toast(1, "暂无数据");
				} else {
					for(var index = 0; index < list.length; index++) {
						var obj = list[index];
						var commodity_list = obj.commodity_list;
						if(obj.refund_no != undefined && obj.refund_no != null) {
							obj.order_no += '(已退款)';
						}
						var html =
							"<li class=\"order_li order_list_click\" id=" + obj.order_no + " name=" + type + " data-type=\"" + obj.order_type +
							"\" >          " +
							"	<div class=\"li_top_div\">                                              " +
							"		<a class=\"li_top_day_tag\">" + obj.day + "</a>                     " +
							"		<a class=\"li_order_no_tag\">NO." + obj.order_no + "</a>            " +
							"	</div>                                                                  " +
							"	<div class=\"li_commodites_div\">                                       " +
							"	<a class=\"commodities_number_tag\">商品(" + obj.commodity_count + ")</a>" +
							"<ul class=\"commodities_ul\">                                               ";

						for(var index2 = 0; index2 < commodity_list.length; index2++) {
							var commodity = commodity_list[index2];
							var specifications_name = commodity.specifications_name;
							if(specifications_name == undefined) {
								specifications_name = "";
							}
							html = html + "<li>" +
								"<a class=\"commodity_name_tag\">" + commodity.commodity_name + "(" + specifications_name + ")</a>" +
								"<a class=\"commodity_number_tag\">x" + commodity.buy_number + "</a>" +
								"<a class=\"price_tag\">" + commodity.count_amount + "</a>" +
								"</li>";
						}

						html = html + "</ul>" +
							"</div>" +
							"<div class=\"li_bottom_div\">" +
							"<a class=\"line_order_time\">" + obj.submit_time_str + "</a>" +
							"<a class=\"order_price_tag\">￥" + obj.amount + "</a>" +
							"</div>";
						$("#order_in_progress_ul").append(html);
					}
					document.getElementById("top_people_static_tag").innerText = "消费人数：" + data.data.user_number + "人";
					document.getElementById("top_number_static_tag").innerText = "消费次数：" + list.length + "次";
					// 取消所有事件绑定
					mui('#order_in_progress_ul').off('tap', '.order_list_click');
					// 重新绑定事件
					// 订单列表点击事件
					mui('#order_in_progress_ul').on('tap', '.order_list_click', function(e) {
						var id = this.getAttribute('id');
						id = id.split("(");
						var type = this.getAttribute("data-type");
						switch(parseInt(type)) {
							case 1: // 酒店类商家
								mui.openWindow({
									url: '/web/order/order_detail_hotel.html',
									id: 'order_detail_hotel.html',
									styles: { 
										top: '0px',
										bottom: '51px',
									},
									extras: {
										'type': this.getAttribute('name'),
										'order_no': id[0],
										'details': '0'
									},
									createNew: true,
									waiting: {
										autoShow: false,
									}
								});
								return;
							default:
								mui.openWindow({
									url: '/web/order/order_detail2.html',
									id: 'order_detail2.html',
									styles: {
										top: '0px',
										bottom: '51px',
									},
									extras: {
										'type': this.getAttribute('name'),
										'order_no': id[0],
										'details': '0'
									},
									createNew: true,
									waiting: {
										autoShow: false,
									}
								});
								break;
						}

					});
				}
			} else if(data.status == 2) {
				mMain.gotoLogin();
				document.getElementById("top_people_static_tag").innerText = "消费人数：0人";
				document.getElementById("top_number_static_tag").innerText = "消费次数：0次";
			} else {
				mui.toast(data.msg);
				document.getElementById("top_people_static_tag").innerText = "消费人数：0人";
				document.getElementById("top_number_static_tag").innerText = "消费次数：0次";
			}
		}
	});
}