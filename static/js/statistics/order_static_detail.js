var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	var year_month = "";
	var order_state = -1;
	//(make_type=0-按订单统计详情，make_type=1-按销售统计详情)
	var current_make_type = -1;
	mui.ready(function() {
		storage = window.localStorage;
		var self = plus.webview.currentWebview();
		year_month = self.year_month;
		order_state = self.state;
		current_make_type = self.make_type;
		document.getElementById("title_tag").innerText = year_month + "月 统计详情";
		getOrderData(order_state);

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getOrderData(order_state);
		});
	});
	//获取订单数据
	function getOrderData(type) {
		toast(2, "打开loading");
		$("#order_in_progress_ul li").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getAllOrderStaticDetail",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"type": type,
				"month_year": year_month,
				"make_type": current_make_type
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					var list = data.data.list;
					if(list.length <= 0) {
						toast(1, "暂无数据");
					} else {
						for(var index = 0; index < list.length; index++) {
							var obj = list[index];
							var commodity_list = obj.commodity_list;
							var html = "<li class=\"order_li\">" +
								"<div class=\"li_top_div\">" +
								"<a class=\"li_top_day_tag\">" + obj.day + "</a>" +
								"<a class=\"li_order_no_tag\">NO." + obj.order_no + "</a>" +
								"</div>" +
								"<div class=\"li_commodites_div\">" +
								"<a class=\"commodities_number_tag\">商品(" + obj.commodity_count + ")</a>" +
								"<ul class=\"commodities_ul\">";
							for(var index2 = 0; index2 < commodity_list.length; index2++) {
								var commodity = commodity_list[index2];
								html = html + "<li>" +
									"<a class=\"commodity_name_tag\">" + commodity.commodity_name + "</a>" +
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
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}
});