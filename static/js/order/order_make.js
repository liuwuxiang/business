// 本地存储
var storage = null;
// 订单号
var order_no = "";
// 订单ID
var order_id = -1;
//剩余可用量
var surplus_available = 0;

mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		// 初始化本地存储
		storage = window.localStorage;
		plus.webview.close("scan.html","none");
		// 获得必要参数
		var self = plus.webview.currentWebview();
		order_no = self.order_no;
		getOrderId(order_no);
		document.getElementById('refund_number_less').addEventListener("tap",function(){
			var dom = document.getElementById('refund_number');
			var number = dom.value;
			if(parseInt(dom.value) > 0){
				dom.value = parseInt(number)-1;
			}
			
		});
		document.getElementById('refund_number_add').addEventListener("tap",function(){
			var dom = document.getElementById('refund_number');
			var number = dom.value;
			if(parseInt(number)+1 <= surplus_available){
				dom.value = parseInt(number)+1;
			}
			
		});
		document.getElementById('order_make').addEventListener("tap",function(){
			orderMake();
		});
	});
	
	//订单使用
	function orderMake() {
		var dom = document.getElementById('refund_number');
		var make_number = dom.value;
		if(parseInt(make_number) <= 0){
			mui.toast("使用数量不可小于等于0");
		}
		else if(parseInt(make_number) > surplus_available){
			mui.toast("此订单剩余使用量为:"+surplus_available+"件");
		}
		else{
			toast(2, "打开loading");
			jQuery.support.cors = true;
			jQuery.ajax({
				url: mMain.url + "/wnk_business_app/v2.0.0/wnkOrderMake",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage['business_id'],
					"order_id"   : order_id,
					"make_number":make_number
				},
				success: function(data) {
					console.log(JSON.stringify(data));
					toast(3, "关闭loading");
					if(data.status == 0) {
						mui.toast(data.msg);
						plus.webview.close('order_detail2.html', 'none');
						mui.openWindow({
							url: '/web/order/order_detail2.html',
							id: 'order_detail2.html',
							styles: {
								top: '0px',
								bottom: '51px',
							},
							extras: {
								'order_no': order_no
							},
							createNew: true,
							waiting:{
								autoShow:false,
							}
						});
					} else if(data.status == 2) {
						mMain.gotoLogin();
					} else {
						mui.toast(data.msg);
					}
				},
			});
		}
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
				order_id = data.data.order_id;
				getOrderDetail();
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
			}
		},
	});
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
				surplus_available = data.data.surplus_available;
				document.getElementById("surplus_available").innerText        = surplus_available+"件";
				document.getElementById("refund_number").value        = surplus_available;
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