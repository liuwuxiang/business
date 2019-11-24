// 本地存储
var storage = null;
// 订单ID
var order_id = -1;
var user_id = -1;

mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		// 初始化本地存储
		storage = window.localStorage;
		
		// 获得必要参数
		var self = plus.webview.currentWebview();
		order_id = getOrderId(self.order_no);
		
		
		plus.webview.close("order_make.html","none");

		getOrderDetail();
		
		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			order_id = getOrderId(self.order_no);
			getOrderDetail();
		});
		
		// 使用记录按钮事件
		document.getElementById('make_record').addEventListener('tap', makeRecord);
		// 退款记录按钮事件
		document.getElementById('refund_record').addEventListener('tap', refundRecord);
		// 申请退款按钮事件
		document.getElementById('apply_refund').addEventListener('tap', applyRefund);
		
		//进入使用记录页面
		function makeRecord(){
			mui.openWindow({
				url: './make_record.html',
				id: 'make_record.html',
				styles: {
					top: '0px',
					bottom: '51px'
				},
				extras: {
					'order_id'    : order_id
				},
				createNew: true,
				waiting:{
			    autoShow:false,
			  }
			});
		}
		
		//进入退款记录页面
		function refundRecord(){
			mui.openWindow({
				url: './refund_record.html',
				id: 'refund_record.html',
				styles: {
					top: '0px',
					bottom: '51px'
				},
				extras: {
					'order_id'    : order_id
				},
				createNew: true,
				waiting:{
			    autoShow:false,
			  }
			});
		}
		
		//进入退款申请页面
		function applyRefund(){
			mui.openWindow({
				url: './order_refund.html',
				id: 'order_refund.html',
				styles: {
					top: '0px',
					bottom: '51px'
				},
				extras: {
					'order_id'    : order_id
				},
				createNew: true,
				waiting:{
			    autoShow:false,
			  }
			});
		}
	});

	// 通过订单号获取订单ID
	function getOrderId(order_no) {
		// 如果没查到就返回 -1
		var order = -1;
		toast(2, "打开loading");
		$("#commodities_ul li").remove();
		jQuery.support.cors = true;
		jQuery.ajax({
			url: mMain.url + "/wnk_business_app/v2.0.0/getWnkOrderIdByOrderId",
			type: "POST",
			dataType: 'json',
			async: false, // 需要为同步请求.不然无法正常返回
			data: {
				'order_no': order_no
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
			url: mMain.url + "/wnk_business_app/v2.0.0/wnkBuyOrderDetail",
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
					document.getElementById("commodity_number_tag").innerText = "商品("+list.length+")";
					document.getElementById("order_price").innerText        = "￥"+data.data.amount;
					var general_integral = data.data.general_integral;
	                var send_integral = data.data.send_integral;
	                var coupon = data.data.coupon;
	                if(general_integral > 0.00){
	                		document.getElementById("general_integral").innerText = "-"+general_integral;
	                }
	                else{
	                		$("#general_integral_div").hide();
	                }
	                if(send_integral > 0.00){
	                		document.getElementById("send_integral").innerText = "-"+send_integral;
	                }
	                else{
	                		$("#send_integral_div").hide();
	                }
	                if(coupon > 0){
	                		document.getElementById("coupon").innerText = "-"+coupon+"张";
	                }
	                else{
	                		$("#coupon_div").hide();
	                }
					document.getElementById("sj_pay_amount").innerText = "￥"+data.data.cash_amount;
					//等级积分减少数量
					var level_integral = general_integral + data.data.cash_amount;
					document.getElementById("level_integral").innerText        = "减少"+parseInt(level_integral)+"积分";
					document.getElementById("account_amount_income").innerText        = "收入"+level_integral+"元";
					document.getElementById("order_no").innerText        = "NO."+data.data.order_no;
					document.getElementById("line_date").innerText        = data.data.submit_time_str;
					document.getElementById("pay_date").innerText        = data.data.pay_time_str;
					document.getElementById("pay_way").innerText        = data.data.pay_way_str;
					
					if(data.data.state != 1){
						$("#apply_refund").hide();
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