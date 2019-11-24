var storage = null;
mui.init();
//类型(0-法律声明,1-价格声明,2-隐私政策,3-餐饮安全管理,4-用户协议)
var look_type = 0;
mui.plusReady(function(){
	
	mui.ready(function(){
		storage = window.localStorage;
		var self = plus.webview.currentWebview();
		look_type = self.look_type;
		if(look_type == 0){
			$('.head > h1').html("法律声明");
		}
		else if(look_type == 1){
			$('.head > h1').html("价格声明");
		}
		else if(look_type == 2){
			$('.head > h1').html("隐私政策");
		}
		else if(look_type == 3){
			$('.head > h1').html("餐饮安全管理");
		}
		else if(look_type == 4){
			$('.head > h1').html("用户协议");
		}
		
		// 获取帮助说明内容
		selectHelpByType(look_type);

	});
	
	/**
	 * 获取帮助说明内容
	 */
	function selectHelpByType(type){
		toast(2, "开启loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/app/v1.0.0/getAboutHelpContent', 
			type: "POST",
			dataType: 'json',
			data: {
				"type": type,
				'about': 1
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
