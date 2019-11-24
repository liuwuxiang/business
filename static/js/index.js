var clientid = "";
mui.init();
mui.plusReady(function() {
	var storage = window.localStorage;

	mui.ready(function() {
		// mMain.gotoLogin(); 
		// 添加点击事件
		mui('.mui-bar').on('tap', '.mui-tab-item', function() {
			var id = this.getAttribute('id');
			var urls;
			switch(String(id)) {
				case 'orders':
					urls = '/web/order/orders.html';
					break;
				case 'commodities':
					urls = '/web/goods/commodities.html';
					break;
				case 'statistics':
					urls = '/web/statistics/statistics2.html';
					break;
				case 'my':
					urls = '/web/my/my.html';
					break;
			}
			mMain.selectBusinessLegalize();
			mui.openWindow({
				url: urls,
				id: id + '.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				show: {
					aniShow: 'none', //页面显示动画，默认为”slide-in-right“；
				},
				waiting: {
					autoShow: true, //自动显示等待框，默认为true
				}
			});
		})

		// 重写返回按钮事件 (天坑)
		plus.key.addEventListener('keydown', overrideBack, false);

		// 获取未读消息数量
		getAdUnread();
		
		// 模拟点击订单页面
		 mui.trigger(mui('#orders')[0], 'tap');

		// 从别个页面返回时触发
		window.addEventListener('updateRead', function(event) {
			console.log(1);
			getAdUnread();
		});
		
		setTimeout(function(){
			// 关闭雪花
			plus.navigator.closeSplashscreen();
		},2000);
		getPushInfo();
	})

	function getAdUnread() {
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business_app/v1.0.0/getAdUnread',
			type: "post",
			dataType: 'json',
			timeout: 5000,
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				$.hideLoading();
				if(data.status == 0 && data.data != null && data.data.unread != 0 ) {
					$('#msg').css('display', 'inline');
					$('#msg').text(data.data.unread);
					getSystemMsg(); 
				} else {
					$('#msg').css('display', 'none');
					$('#msg').text(0);
					getSystemMsg();
				}

			},
			error: function() {
				// 关闭加载中的Loading层
				$.hideLoading();
				// 打开数据加载失败的toast
				$.toast("数据加载失败", "text");
			}
		});
	}

	// 获取未读系统消息条目数
	function getSystemMsg() {
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business_app/v1.0.0/getSystemMsg',
			type: "post",
			dataType: 'json',
			timeout: 5000,
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				$.hideLoading();
				if(data.status == 0 && data.data != null && data.data.unread != 0) {
					$('#msg').css('display', 'inline');
					$('#msg').text(parseInt($('#msg').text())+data.data.unread); 
				} else {
					if(parseInt($('#msg').text()) == 0) {
						$('#msg').css('display', 'none');
					}
				}

			},
			error: function() {
				// 关闭加载中的Loading层
				$.hideLoading();
				// 打开数据加载失败的toast
				$.toast("数据加载失败", "text");
			}
		});
	}

	//处理逻辑：1秒内，连续两次按返回键，则退出应用；
	var first = null;
	// 重写返回事件
	function overrideBack(e) {
		if(e.keyCode == 4) {
		
			// 获取应用显示栈顶的WebviewObject窗口对象
			var h = plus.webview.getTopWebview();
			if(String(h.id) == 'commodities.html' ||
				String(h.id) == 'orders.html' ||
				String(h.id) == 'statistics.html' ||
				String(h.id) == 'my.html' ||
				String(h.id) == 'login.html') {
				//首次按键，提示‘再按一次退出应用’
				if(!first) {
					first = new Date().getTime();
					mui.toast('再按一次退出应用');
					setTimeout(function() {
						first = null;
					}, 1000);
				} else {
					if(new Date().getTime() - first < 1000) {
						plus.runtime.quit();
					}
				}

			} else {
				// 触发父页面的keydownClose事件,进行数据重新加载
				var view = plus.webview.all();
				mui.fire(view[view.length - 2], 'keydownClose');
				var webId = plus.webview.getTopWebview().id;
				// for 循环关闭
				for (var i = 0; i < view.length; i++) {
					plus.webview.close(webId, 'slide-out-right');
				}
				// 关闭当前页面
				//plus.webview.close(plus.webview.getTopWebview().id, 'slide-out-right');
			}

		}
	}
	
	/*
	 *	获取个推客户端推送标识
	 * */
	function getPushInfo(){
	    var info = plus.push.getClientInfo();
	    var token = info.token;
	    clientid = info.clientid;
	    var appid = info.appid;
	    var appkey = info.appkey;
	    console.log("token="+token+",clientid="+clientid+",appid="+appid+",appkey="+appkey);
//	    toast(1,"token="+token+",clientid="+clientid+",appid="+appid+",appkey="+appkey);
		loadBusinessGetuiTag();
	}
	
	//上传商家个推标识
	function loadBusinessGetuiTag() {
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business_app/v1.0.0/updateStoreGeTuiAppId',
			type: "post",
			dataType: 'json',
			timeout: 5000,
			data: {
				"business_id": storage["business_id"],
				"getui_app_id":clientid
			},
			success: function(data) {
				

			},
			error: function() {
				
			}
		});
	}
});