var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	
	var order_id;
	var user_id
	
	mui.ready(function() {
		storage =  window.localStorage;
		var self = plus.webview.currentWebview();
		order_id = self.order_id;
		user_id  = self.user_id;
		
		plus.webview.close("scan.html","none");
		
		webLoad(user_id, order_id);
		document.getElementById('integralOrderUse').addEventListener('tap', integralOrderUse);
	})

	/**
	 * 初始化
	 */
	function webLoad(user_id, order_id) {
		// 获取订单详情
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business/getIntegralOrderByOrderId",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"order_no": order_id,
				"user_id": user_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(parseInt(data.status) === 0) {
					$('#goods_name')[0].innerText = data.data.goods_name;
					$('#creation_time')[0].innerText = data.data.creation_time;
					$('#orderId')[0].innerText = data.data.order_id;
					$('#price')[0].innerText = data.data.price + '积分';
					$('#phone')[0].innerText = data.data.phone;
					$('#status')[0].innerText = data.data.status;
					$('#username')[0].innerText = data.data.username;
					$('#end_time')[0].innerText = data.data.end_time === undefined ? '' : data.data.end_time;
					// 使用订单按钮是否显示
					var submitBtn = $('.weui-form-preview__btn_primary').css('display', 'none');
					if(data.data.status === '已完成') {
						submitBtn.css('display', 'none');
					} else {
						submitBtn.css('display', 'inline');
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			}
		});
	}

	/**
	 * 使用订单操作
	 */
	function integralOrderUse() {
		$.confirm("确认发货?", '信息:', function() {
			toast(2, "打开loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business/integralOrderUse",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"order_id"   : order_id,
					"user_id"    : user_id
				},
				success: function(data) {
					toast(3, "关闭loading");
					mui.alert(data.msg, '猛戳商家版', function() {
						mMain.back();
					});
				}

			});
		});
	}

});