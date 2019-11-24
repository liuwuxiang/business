var storage = null;
mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		storage = window.localStorage;

		// 获取记住密码状态
		var isRemember = plus.storage.getItem('remember');
		if (String(isRemember) === 'true') {
			document.getElementById('Remember').checked = true;
			document.getElementById("mobile").value = plus.storage.getItem('remember_mobile');
			document.getElementById("login_pwd").value = plus.storage.getItem('remember_pwd');
		}
		
		//plus.storage.clear();
		
		// 获取是否已经登陆了
		if (storage['business_id'] !== undefined && storage['business_id'] != null && String(storage['business_id']) !=
			'') {
			mui.openWindow({
				url: './index.html',
				id: 'index.html',
				styles: {
					top: '0px',
					bottom: '0px',
				},
				createNew: true
			});
		} else if (plus.storage.getItem("isOne") === null) {
			mui.openWindow({
				url: './isOne.html',
				id: 'isOne.html',
				styles: {
					top: '0px',
					bottom: '0px',
				},
				createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
				waiting: {
					autoShow: false, //自动显示等待框，默认为true
				}
			});
		} else {
			// 延时500毫秒关闭雪花
			setTimeout(function() {
				// 关闭雪花
				plus.navigator.closeSplashscreen();
			}, 2000);
		}

		// 绑定事件
		binding();

	});

	/**
	 * 事件绑定
	 */
	function binding() {
		// 绑定登陆方式切换事件
		mui('.tabmenu').on('tap', 'a', function() {
			var id = this.getAttribute('id');
			if (String(id) === 'account_login') {
				loginWayClick(0);
			} else {
				loginWayClick(1);
			}
		})
		// 四个输入框输入内容后点击获取焦点在文本最右边
		document.getElementById('mobile').addEventListener('focus', focusRigth);
		document.getElementById('login_pwd').addEventListener('focus', focusRigth);
		document.getElementById('quick_mobile').addEventListener('focus', focusRigth);
		document.getElementById('quick_login_code').addEventListener('focus', focusRigth);
		// 手机号+密码登陆事件
		document.getElementById('account_login_from_submit').addEventListener('tap', mobileAndPwdLogin);
		// 获取短信验证码
		document.getElementById('quick_login_code_btn').addEventListener('tap', getMobileCode);
		// 快捷登录事件
		document.getElementById('code_login_from_submit').addEventListener('tap', quickLoginAction);

		mui('.hadle').on('tap', 'a', function() {
			plus.webview.close(plus.webview.getWebviewById('protocol.html'));
			mui.openWindow({
				url: './protocol.html',
				id: 'protocol.html',
				styles: {
					top: '0px',
					bottom: '0px'
				},
				createNew: true,
				extras: {
					xieyi_type: '0' // 0 - 商家协议 1-商家升级协议
				}
			});
		});


	}

	/**
	 * 焦点默认在文本右边
	 */
	function focusRigth() {
		this.value = this.value;
	}


	/**
	 * 登录方式切换
	 * @param {Object} index 0-账号密码登录,1-手机快捷登录
	 */
	function loginWayClick(index) {
		var account_login = document.getElementById("account_login_from");
		var code_login = document.getElementById("code_login_from");
		if (index == 0) {
			account_login.style.display = "block";
			code_login.style.display = "none";
			document.getElementById("account_login").setAttribute("class", "item sel");
			document.getElementById("code_login").setAttribute("class", "item");
		} else {
			code_login.style.display = "block";
			account_login.style.display = "none";
			document.getElementById("code_login").setAttribute("class", "item sel");
			document.getElementById("account_login").setAttribute("class", "item");
		}
	}
	/**
	 * 手机号+密码登录事件
	 */
	function mobileAndPwdLogin() {

		var mobile = document.getElementById("mobile").value;
		var login_pwd = document.getElementById("login_pwd").value;

		// 记住密码操作
		if (document.getElementById('Remember').checked) {
			plus.storage.setItem('remember', String('true'));
			plus.storage.setItem('remember_mobile', String(mobile));
			plus.storage.setItem('remember_pwd', String(login_pwd));
		} else {
			plus.storage.clear();
		}

		if (mobile == undefined || mobile == '') {
			mui.toast('请输入手机号');
			return;
		}
		if (login_pwd == undefined || login_pwd == '') {
			mui.toast('请输入密码');
			return;
		}
		toast(2, "开启loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/mobileAndPwdLogin",
			type: "POST",
			dataType: 'json',
			data: {
				"mobile": mobile,
				"login_pwd": login_pwd
			},
			success: function(data) {
				toast(3, "关闭loading");
				if (data.status == 0) {
					saveUserInformation(data);
					mui.openWindow({
						url: './index.html',
						id: 'index.html',
						styles: {
							top: '0px',
							bottom: '0px',
						},
						createNew: true
					});
				} else {
					toast(0, data.msg);
				}
			}
		});

	}
	/**
	 * 获取短信验证码
	 */
	function getMobileCode() {
		var quick_mobile = document.getElementById("quick_mobile").value;
		if (quick_mobile == undefined || quick_mobile == '') {
			mui.toast("请输入手机号");
		} else {
			toast(2, "开启loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/getMobileCode",
				type: "POST",
				dataType: 'json',
				data: {
					"mobile": quick_mobile,
					"type": 8 + ''
				},
				success: function(data) {
					toast(3, "关闭loading");
					if (data.status == 0) {
						mui.toast("获取成功");
					} else {
						mui.toast(data.msg);
					}
				},
			});
		}
	}
	/**
	 * 快捷登录事件
	 */
	function quickLoginAction() {
		var quick_mobile = document.getElementById("quick_mobile").value;
		var quick_login_code = document.getElementById("quick_login_code").value;
		if (quick_mobile == undefined || quick_mobile == '') {
			mui.toast("请输入手机号");
			return;
		}
		if (quick_login_code == undefined || quick_login_code == '') {
			mui.toast("请输入验证码");
			return;
		}
		toast(2, "开启loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/businessMobileAndCodeLogin",
			type: "POST",
			dataType: 'json',
			data: {
				"mobile": quick_mobile,
				"code": quick_login_code
			},
			success: function(data) {
				toast(3, "关闭loading");
				if (data.status == 0) {
					saveUserInformation(data);
					mui.openWindow({
						url: './index.html',
						id: 'index.html',
						styles: {
							top: '0px',
							bottom: '0px',
						},
						createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
					});
				} else {
					toast(0, data.msg);
				}
			},
		});

	}
	/**
	 * 保存用户信息
	 * @param {Object} data 登录成功返回的data
	 */
	function saveUserInformation(data) {
		var user_id = data.data.business_id;
		var login_session = data.data.login_session;
		storage.setItem("business_id", user_id);
		storage.setItem("login_session", login_session);
	}

})
