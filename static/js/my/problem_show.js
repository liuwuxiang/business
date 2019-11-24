var storage = null;
mui.init();
mui.plusReady(function(){
	
	mui.ready(function(){
		storage = window.localStorage;
		var self = plus.webview.currentWebview();
		if(self.type == 1){
			$('.head > h1').html('活动详情');
			selectadById(self.img_url);
		} else {
			// 根据ID查询常见问题详情
			selectProblemById(self.problem_id);
		}
		
		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			selectProblemById(self.problem_id);
		});

	});
	
	/**
	 * 获取所有已经启用的常见问题
	 */
	function selectProblemById(problem_id){
		toast(2, "开启loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business_app/v1.0.0/selectProblemById',
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				'problem_id' : problem_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					$('#problem_title').html(data.data.title);
					$('#problem_content').html(data.data.content);
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}


	function selectadById(ad_id){
		$('#problem_title').remove();
		$('#problem_content').html('<img src="' + ad_id + '" />');
	}

});
