// 本地存储
var storage = null;
// 订单ID
var order_id = -1;

mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		// 初始化本地存储
		storage = window.localStorage;
		
		// 获得必要参数
		var self = plus.webview.currentWebview();
		order_id = self.order_id;

		wnkOrderRefundRecord();
		
	});
});

	//获取订单使用记录
	function wnkOrderRefundRecord() {
		toast(2, "打开loading");
		$(".commodities_ul li").remove();
		publicnull_tip("暂无数据",1);
		jQuery.support.cors = true;
		jQuery.ajax({
			url: mMain.url + "/wnk_business_app/v2.0.0/wnkOrderRefundRecord",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage['business_id'],
				"order_id"   : order_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					publicnull_tip("关闭提示",0);
					var list = data.data;
                for (var index = 0;index < list.length; index++){
                        var obj = list[index];
                        var html = "<li>"+
					  					"<a>退款时间:</a>"+
					  					"<span>"+obj.refund_date_str+"</span>"+
					  					"<a>退款流水号:</a>"+
					  					"<span>"+obj.refund_no+"</span>"+
					  					"<a>退款数量:</a>"+
					  					"<span>"+obj.refund_number+"件</span>"+
					  					"<a>通用积分:</a>"+
					  					"<span>"+obj.general_integral+"积分</span>"+
					  					"<a>优惠券:</a>"+
					  					"<span>"+obj.coupon+"张</span>"+
					  					"<a>现金劵:</a>"+
					  					"<span>"+obj.send_integral+"</span>"+
					  					"<a>现金:</a>"+
					  					"<span>"+obj.cash+"元</span>"+
					  					"<a>原因:</a>"+
					  					"<span>"+obj.refund_reason+"</span>"+
					  				"</li>";
                        $(".commodities_ul").append(html);
                    }
					
				} else if(data.status == 2) {
					mMain.gotoLogin();
					publicnull_tip(data.msg,1);
				} else {
					mui.toast(data.msg);
					publicnull_tip(data.msg,1);
				}
			},
		});
	}

/*
* 提示修改
* */
function publicnull_tip(content,state) {
    var publicnull_tip = document.getElementById("publicnull_tip");
    if (state == 0){
        publicnull_tip.style.display = "none";
    }
    else{
        document.getElementById("request_tip").innerText = content;
        publicnull_tip.style.display = "block";
    }
}