var storage = window.localStorage;

mui.init();
//注意：若为ajax请求，则需将如下代码放在处理完ajax响应数据之后；
mui.plusReady(function() {
	mui.ready(function() {
		var self = plus.webview.currentWebview();
		// 点击事件
		mui('.memmenu').on('tap', '.item', function() {
// 			var name = this.getAttribute('name');
// 			// 页面ID
// 			var id;
// 			// 页面相对路径
// 			var url;
// 			switch (name) {
// 				case 'legal_declaration': // 法律声明
// 					url = "../about_us/legal_declaration.html";
// 					id = "legal_declaration.html";
// 					break;
// 
// 				case 'price_description': // 价格说明
// 					url = "../about_us/price_description.html";
// 					id = "price_description.html";
// 					break;
// 
// 				case 'privacy_policy': // 隐私政策
// 					url = "../about_us/privacy_policy.html";
// 					id = "privacy_policy.html";
// 					break;
// 
// 				case 'food_safety': // 餐饮安全管理办法
// 					url = "../about_us/food_safety.html";
// 					id = "food_safety.html";
// 					break;
// 				default:
// 					mui.toast('错误...');
// 					return;
// 			}
// 			mui.openWindow({
// 				url: url,
// 				id: id,
// 				styles: {
// 					top: '0px',
// 					bottom: '51px',
// 				},
// 				extras: {},
// 				createNew: true,
// 			});

			var name = this.getAttribute('name');
			// 页面ID
			var id;
			// 页面相对路径
			var url;
			//类型(0-法律声明,1-价格声明,2-隐私政策,3-餐饮安全管理,4-用户协议)
			var look_type = 0;
			switch (name) {
				case 'legal_declaration': // 法律声明
					look_type = 0;
					break;

				case 'price_description': // 价格说明
					look_type = 1;
					break;

				case 'privacy_policy': // 隐私政策
					look_type = 2;
					break;

				case 'food_safety': // 餐饮安全管理办法
					look_type = 3;
					break;
				case 'user_agreement': // 用户协议
					look_type = 4;
					break;
				default:
					mui.toast('错误...');
					return;
			}
			mui.openWindow({
				url: '../about_us/about_us_detail.html',
				id: 'about_us_detail.html',
				extras: {
					look_type: look_type
				},
				styles: {
					top: '0px',
					bottom: '0px',
				},
				createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});



		})
	})
})
