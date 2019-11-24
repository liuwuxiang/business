var storage = null;
mui.init({
	pullRefresh: {
		container: '#slider',
		down: {
			style: 'circle',
			callback: pullupRefresh,
			height: '2rem', //可选,默认50px.下拉刷新控件的高度,
			range: '2rem', //可选 默认100px,控件可下拉拖拽的范围
			offset: '0px', //可选 默认0px,下拉刷新控件的起始位置
		},
	}
});

function pullupRefresh() {
	optionClick(0);
	mui('#slider').pullRefresh().endPulldownToRefresh();
}
mui.plusReady(function() {
	mui.ready(function() {
		storage = window.localStorage;
		mui('.wrap').on('tap', '.item', function() {
			if (String(this.getAttribute('id')) == 'order_statistics') {
				optionClick(0);
			} else {
				optionClick(1);
			}
		})
		mui('#amount_count_statistics_ul').on('tap', 'li', function() {
			var name = this.getAttribute('name');
			name = name.split("|");
			orderStatisticsDetail(name[0], name[1], name[2]);
		})
		mui('#order_count_statistics_ul').on('tap', 'li', function() {
			var name = this.getAttribute('name');
			name = name.split("|");
			orderStatisticsDetail(name[0], name[1], name[2]);
		})
		mui('#finish_order_statistics_ul').on('tap', 'li', function() {
			var name = this.getAttribute('name');
			name = name.split("|");
			orderStatisticsDetail(name[0], name[1], name[2]);
		})
		mui('#new_order_statistics_ul').on('tap', 'li', function() {
			var name = this.getAttribute('name');
			name = name.split("|");
			orderStatisticsDetail(name[0], name[1], name[2]);
		})
		optionClick(0);

	});
});
//选项卡事件(0-订单统计被点击,1-销售统计被点击)
function optionClick(index) {
	var order_div = document.getElementById("order_statistics_div");
	var seal_div = document.getElementById("seal_statistics_div");
	if (index == 0) {
		order_div.style.display = "block";
		seal_div.style.display = "none";
		document.getElementById("order_statistics").setAttribute("class", "item sel");
		document.getElementById("seal_statistics").setAttribute("class", "item");
		getOrderStatisticsData();
	} else {
		seal_div.style.display = "block";
		order_div.style.display = "none";
		document.getElementById("seal_statistics").setAttribute("class", "item sel");
		document.getElementById("order_statistics").setAttribute("class", "item");
		getSaleStatisticsData();
	}
}
//获取订单统计数据
function getOrderStatisticsData() {
	toast(2, "打开loading");
	$("#new_order_statistics_ul li").remove();
	$("#finish_order_statistics_ul li").remove();
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/countAllOrderByMonth',
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			toast(3, "关闭loading");
			if (data.status == 0) {
				var finish_order_list = data.data.finish_order;
				var new_order_list = data.data.new_order;
				for (var index = 0; index < new_order_list.length; index++) {
					var obj = new_order_list[index];
					var html =
						"<li name=\"" + obj.year_month_str + "|0|0\">" +
						"<a class=\"month_name_tag\">" + obj.year_month_str + "</a>" +
						"<div class=\"progress_div\">" +
						"<div class=\"progress\">" +
						"<div class=\"progress-bar progress-bar-info progress-bar-striped active\" style=\"width: " + obj.bili +
						"%;\">" +
						"<div class=\"progress-value\">" + obj.count + "单</div>" +
						"</div>" +
						"</div>" +
						"</div>" +
						"</li>";
					$("#new_order_statistics_ul").append(html);
				}
				for (var index = 0; index < finish_order_list.length; index++) {
					var obj = finish_order_list[index];
					var html = "<li name=\"" + obj.year_month_str + "'|1|0\">" +
						"<a class=\"month_name_tag\">" + obj.year_month_str + "</a>" +
						"<div class=\"progress_div\">" +
						"<div class=\"progress\">" +
						"<div class=\"progress-bar progress-bar-info progress-bar-striped active\" style=\"width: " + obj.bili +
						"%;\">" +
						"<div class=\"progress-value\">" + obj.count + "单</div>" +
						"</div>" +
						"</div>" +
						"</div>" +
						"</li>";
					$("#finish_order_statistics_ul").append(html);
				}
			} else if (data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
			}
		},
	});
}
//获取销售统计数据
function getSaleStatisticsData() {
	toast(2, "打开loading");
	$("#order_count_statistics_ul li").remove();
	$("#amount_count_statistics_ul li").remove();
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/countAllIncomeByMonth",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			toast(3, "关闭loading");
			if (data.status == 0) {
				var order_list = data.data.order;
				var count_amount_list = data.data.count_amount;
				for (var index = 0; index < order_list.length; index++) {
					var obj = order_list[index];
					var html = "<li name=\"" + obj.year_month_str + "|0|1\">" +
						"<a class=\"month_name_tag\">" + obj.year_month_str + "</a>" +
						"<div class=\"progress_div\">" +
						"<div class=\"progress\">" +
						"<div class=\"progress-bar progress-bar-info progress-bar-striped active\" style=\"width: " + obj.bili +
						"%;\">" +
						"<div class=\"progress-value\">" + obj.count + "单</div>" +
						"</div>" +
						"</div>" +
						"</div>" +
						"</li>";
					$("#order_count_statistics_ul").append(html);
				}
				for (var index = 0; index < count_amount_list.length; index++) {
					var obj = count_amount_list[index];
					var html = "<li name=\"" + obj.year_month_str + "|1|1\">" +
						"<a class=\"month_name_tag\">" + obj.year_month_str + "</a>" +
						"<div class=\"progress_div\">" +
						"<div class=\"progress\">" +
						"<div class=\"progress-bar progress-bar-info progress-bar-striped active\" style=\"width: " + obj.bili +
						"%;\">" +
						"<div class=\"progress-value\">" + obj.count_amount + "元</div>" +
						"</div>" +
						"</div>" +
						"</div>" +
						"</li>";
					$("#amount_count_statistics_ul").append(html);
				}
			} else if (data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
			}
		},
	});
}
//订单统计详情
function orderStatisticsDetail(year_month, state, make_type) {
	mui.openWindow({
		url: './order_static_detail.html',
		id: 'order_static_detail.html',
		styles: {
			top: '0px',
			bottom: '51px',
		},
		extras: {
			'year_month': year_month,
			'state': state,
			'make_type': make_type
		},
		createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		show: {
			autoShow: true, //页面loaded事件发生后自动显示，默认为true
			aniShow: 'none', //页面显示动画，默认为”slide-in-right“；
			duration: '200' //页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
		}
	});
}
