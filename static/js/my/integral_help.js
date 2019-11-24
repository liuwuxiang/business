var storage = null;
mui.init();
mui.plusReady(function(){
	
	mui.ready(function(){
		storage = window.localStorage;
		var self = plus.webview.currentWebview();
		var title = self.title;
		var type = self.type;
		$('.head > h1').html(title);
		// 根据ID查询常见问题详情
		selectHelpByType(type);

	});
	
	/**
	 * 获取积分帮助说明
	 */
	function selectHelpByType(type){
		toast(2, "开启loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/app/v1.0.0/getIntegralHelpContent',
			type: "POST",
			dataType: 'json',
			data: {
				"type": type
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					$('#problem_content').html(data.data.content);
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(0,data.msg);
				}
			},
		});
	}


});
