// 本地存储
var storage = null;
// 订单ID
var order_id = -1;
//商品单价
var commodity_unit_price = 0.00;
//最大可退款数量
var max_refund_number = 0;

mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		// 初始化本地存储
		storage = window.localStorage;
		
		// 获得必要参数
		var self = plus.webview.currentWebview();
		order_id = self.order_id;
		wnkOrderRefundBaseInformation();
		selectAllOrderRefundReasonRecord();
		document.getElementById('refund_number_less').addEventListener("tap",function(){
			var dom = document.getElementById('refund_number');
			var number = dom.value;
			if(parseInt(dom.value) > 0){
				dom.value = parseInt(number)-1;
			}
			document.getElementById("refund_amount").innerText = "￥"+dom.value * commodity_unit_price;
			
		});
		document.getElementById('refund_number_add').addEventListener("tap",function(){
			var dom = document.getElementById('refund_number');
			var number = dom.value;
			if(parseInt(number)+1 <= max_refund_number){
				dom.value = parseInt(number)+1;
			}
			document.getElementById("refund_amount").innerText = "￥"+dom.value * commodity_unit_price;
		});
		
		//申请退款按钮事件
		document.getElementById('refund_button').addEventListener("tap",function(){
			wnkOrderRefund();
		});
	});
	
	
	//商品退款
	function wnkOrderRefund() {
		//退款数量
		var refund_number = document.getElementById('refund_number').value;
		//退款原因
		var refund_reason = $("input[name='checkbox1']:checked").val();
		if(refund_number <= 0){
			mui.toast("退款数量不可为0");
		}
		else if(refund_number > max_refund_number){
			mui.toast("退款数量不可大于"+max_refund_number);
		}
		else if(refund_reason == undefined || refund_reason == ""){
			mui.toast("请选择退款原因");
		}
		else{
			toast(2, "打开loading");
			jQuery.support.cors = true;
			jQuery.ajax({
				url: mMain.url + "/wnk_business_app/v2.0.0/wnkOrderRefund",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage['business_id'],
					"order_id"   : order_id,
					"refund_number"   : refund_number,
					"refund_reason"   : refund_reason,
				},
				success: function(data) {
					toast(3, "关闭loading");
					if(data.status == 0) {
						mui.toast(data.msg);
						var view = plus.webview.all();
						// 重点
						mui.fire(view[view.length - 2], 'keydownClose');
						// 关闭当前页面
						plus.webview.close(plus.webview.getTopWebview().id, 'slide-out-right');
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

//获取订单退款基础支撑信息
function wnkOrderRefundBaseInformation() {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	jQuery.ajax({
		url: mMain.url + "/wnk_business_app/v2.0.0/wnkOrderRefundBaseInformation",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage['business_id'],
			"order_id"   : order_id
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(data.status == 0) {
				commodity_unit_price = data.data.commodity_unit_price;
				max_refund_number = data.data.max_refund_number;
				document.getElementById("refund_number").value = max_refund_number;
				document.getElementById("refund_amount").innerText = "￥"+max_refund_number * commodity_unit_price;
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
			}
		},
	});
}

	//获取所有供选择的退款原因
	function selectAllOrderRefundReasonRecord() {
		toast(2, "打开loading");
		$("#refund_reason_div label").remove();
		jQuery.support.cors = true;
		jQuery.ajax({
			url: mMain.url + "/app/v2.0.0/selectAllOrderRefundReasonRecord",
			type: "POST",
			dataType: 'json',
			data: {
				
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
				var list = data.data;
                for (var index = 0;index < list.length; index++){
                        var obj = list[index];
                        var html = "<label class=\"weui-cell weui-check__label\" for=\"s0"+obj.id+"\">"+
										"<div class=\"weui-cell__bd\">"+
											"<p>"+obj.reason+"</p>"+
										"</div>"+
										"<div class=\"weui-cell__hd\">"+
											"<input type=\"radio\" name=\"checkbox1\" value=\""+obj.reason+"\" class=\"weui-check\" id=\"s0"+obj.id+"\">"+
											"<i class=\"weui-icon-checked\"></i>"+
										"</div>"+
									"</label>";
                        $("#refund_reason_div").append(html);
                    }
					
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}