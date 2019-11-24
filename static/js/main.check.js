/**
 * @Name：登录检测
 * @Author：杨新杰
 * @Site：http://www.it100000.com
 */
!function(win, doc) {
	/**
	 * 返回<br>
	 * 如果页面上有元素的id为back,则添加点击事件<br>
	 * 点击返回个webview. 同时刷新上一个webview页面
	 */
	function back() {
		if(doc.getElementById('back')) {
			doc.getElementById('back').addEventListener('tap', function() {
				var view = plus.webview.all();
				// 重点
				mui.fire(view[view.length - 2], 'keydownClose');
				
				// 关闭当前页面
				plus.webview.close(plus.webview.getTopWebview().id, 'slide-out-right');
			})
			
		}
	}

	//登陆页面地址
	var login_url = '/login.html';
	//登录页面ID
	var login_id = 'login.html';
	//登录条件,true为未登录
	var login_noun = window.localStorage['business_id'] === undefined;

	/**
	 * 检测是否登录,未登录则跳转登录页面
	 */
	function isLogin() {
		if(login_noun) {
			// 清空本地存储
			window.localStorage.clear();
			plus.webview.all().forEach(function(vi){
				// 打包时 把HBuilder换成manifest.json文件中的appid 
				// H5E21842C
				// HBuilder
				if (vi.id !== 'login.html' && vi.id !== 'H5589B2FE'){
					plus.webview.close(vi.id,'auto',10,false);
				}
			})
			// 跳转到登陆页面
			mui.openWindow({
				url: login_url,
				id: login_id,
				styles: {
					top: '0px',
					bottom: '0px',
				}
			});

		}
	}

	/**
	 * 初始化方法
	 */
	function init() {
		// 检测登陆
		isLogin();
		// 绑定返回事件
		back();
	}

	// 初始化
	if(window.plus) {
		init();
	} else {
		document.addEventListener('plusready', init, false);
	}

}(window, document)