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

		getOrderMakeRecord();
		
	});
});

	//获取订单使用记录
	function getOrderMakeRecord() {
		toast(2, "打开loading");
		$(".commodities_ul li").remove();
		publicnull_tip("暂无数据",1);
		jQuery.support.cors = true;
		jQuery.ajax({
			url: mMain.url + "/wnk_business_app/v2.0.0/wnkOrderMakeRecord",
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
						  					"<a>使用时间:</a>"+
						  					"<span>"+obj.make_date_str+"</span>"+
						  					"<a>使用数量:</a>"+
						  					"<span>"+obj.make_number+"件</span>"+
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