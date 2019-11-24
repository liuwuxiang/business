// 本地存储
var storage = null;
// 订单ID
var order_id = -1;
// 订单类型
var type = -1;
var user_id = -1;

mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		// 初始化本地存储
		storage = window.localStorage;
		// 获得必要参数
		var self = plus.webview.currentWebview();
		order_id = getOrderId(self.order_no, self.type);
		type = self.type;
		
		
		plus.webview.close("scan.html","none");

		getOrderDetail();
		
		document.getElementById('submit').addEventListener('tap',function(){
			if(type == 0){
				orderQrcodeMake(user_id,self.order_no);
			} else {
				memberQYQrCodeMake(user_id,self.order_no);
			}
		})
		
		
	});

	// 通过订单号获取订单ID
	function getOrderId(order_no, type) {
		// 如果没查到就返回 -1
		var order = -1;
		toast(2, "打开loading");
		$("#commodities_ul li").remove();
		jQuery.support.cors = true;
		jQuery.ajax({
			url: mMain.url + "/wnk_business/getWnkOrderIdByOrderId",
			type: "POST",
			dataType: 'json',
			async: false, // 需要为同步请求.不然无法正常返回
			data: {
				'order_no': order_no,
				'type'    : 0
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					order = data.data.order_id;
					user_id = data.data.user_id;
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
		return order;
	}

	//获取订单详情
	function getOrderDetail() {
		toast(2, "打开loading");
		$("#commodities_ul li").remove();
		jQuery.support.cors = true;
		jQuery.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/wnkBuyOrderDetail",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage['business_id'],
				"order_id"   : order_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					var list = data.data.commodity_list;
					document.getElementById("business_name").innerText        = data.data.business_name;
					document.getElementById("commodity_number_tag").innerText = "商品(" + list.length + ")";
					document.getElementById("line_time_tag").innerText        = "下单时间：" + data.data.submit_time_str;
					document.getElementById("order_no_tag").innerText         = "订单号：NO." + data.data.order_no;
					document.getElementById("count_amount_tag").innerText     = "总价：￥" + data.data.amount;
					document.getElementById("pay_way_str").innerText          =  "支付方式：" + data.data.pay_way_str;
					document.getElementById("pay_time_str").innerText         =  "付款时间：" + (data.data.pay_time_str == undefined ? '' : data.data.pay_time_str) ;
					if(data.data.state == 1){
						document.getElementById('submit').style.display = 'inline';
					}
					if(plus.webview.currentWebview().details == 0){
						document.getElementById('submit').style.display = 'none';
					}
					for(var index = 0; index < list.length; index++) {
						var obj = list[index];
						var specifications_name = obj.specifications_name;
						if(specifications_name == undefined) {
							specifications_name = "";
						}
						var html = ""+
						"<li>" +
						"	<a class=\"commodity_name_tag\">" + obj.commodity_name + "(" + specifications_name + ")</a>" +
						"	<a class=\"commodity_number_tag\">x1</a>" +
						"	<a class=\"price_tag\">" + obj.count_amount + "</a>" +
						"</li>";
						$("#commodities_ul").append(html);
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//获取万能卡权益订单详情
	function getWnkOrderDetail() {
		toast(2, "打开loading");
		$("#commodities_ul li").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getWnkOrderDetail",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage['business_id'],
				"order_id"   : order_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					document.getElementById("business_name").innerText        = data.data.store_name;
					document.getElementById("commodity_number_tag").innerText = "商品(" + data.data.make_number + ")";
					document.getElementById("line_time_tag").innerText        = "下单时间：" + data.data.line_date;
					document.getElementById("order_no_tag").innerText         = "订单号：NO." + data.data.order_no;
					document.getElementById("count_amount_tag").innerText     = "总价：￥0";
					business_id = data.data.business_id;
					var guige_name = data.data.guige_name;
					if(guige_name == undefined) {
						guige_name = "";
					}
					var html = "<li>" +
						"<a class=\"commodity_name_tag\">" + data.data.commodity_name + "(" + guige_name + ")</a>" +
						"<a class=\"commodity_number_tag\">x" + data.data.make_number + "</a>" +
						"<a class=\"price_tag\">0</a>" +
						"</li>";
					$("#commodities_ul").append(html);
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}


	//会员权益免费使用网络事件
	function memberQYQrCodeMake(user_id, order_no) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/wnkQYOrderMake",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"order_no"   : order_no,
				"user_id"    : user_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				alert(data.msg);
				if (data.status == 0) {
					mMain.back();
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//订单使用
	function orderQrcodeMake(user_id, order_no) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/orderQrcodeMake",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"order_no"   : order_no,
				"user_id"    : user_id
			},
			success: function(data) {
				console.log(JSON.stringify(data));
				toast(3, "关闭loading");
				mui.alert(data.msg,'猛戳商家版',null,null,'div');
				if (data.status == 0) {
					mui.alert(data.msg, '猛戳商家版', null, function() {
						plus.webview.close('scan.html');
						mMain.back();
					},'div');
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}
});