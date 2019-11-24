var mMain = {
	// 请求地址
	url: 'http://m.chenlankeji.cn',
	// url: 'http://192.168.1.8:8080/property_system',
	// 跳转到登陆页面
	gotoLogin: function() {
		// 清空本地存储
		window.localStorage.clear();
		// 跳转到登陆页面
		mui.openWindow({
			url: '/login.html',
			id: 'login.html',
			styles: {
				top: '0px',
				bottom: '0px',
			},
			createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		});
	},
	// 返回键处理
	back: function() {
		var view = plus.webview.all();
		// 重点
		mui.fire(view[view.length - 2], 'keydownClose');
		// 关闭当前页面
		plus.webview.close(plus.webview.getTopWebview().id, 'slide-out-right');
	},
	// 查询商家认证状态
	selectBusinessLegalize: function() {
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessLegalize",
			type: "POST",
			dataType: 'json',
			timeout: 10000,
			data: {
				'business_id': window.localStorage['business_id']
			},
			success: function(data) {
				if(data.status == 0) {
					if(data.data.status == '未上传认证信息') {
						mui.confirm('请上传认证信息', '猛戳商家版', ['确定', '退出'], function(e) {
							if(e.index == 0) {
								mui.openWindow({
									url: '/web/business_legalize/legalize_tis.html',
									id: 'legalize_tis.html',
									styles: {
										top: '0px',
										bottom: '51px',
									},
									createNew: true,
								});
							} else {
								// 清空本地存储
								window.localStorage.clear();
								plus.webview.all().forEach(function(vi) {
									// 打包时 把HBuilder换成manifest.json文件中的appid 
									// HBuilder
									if(vi.id !== 'login.html' && vi.id !== 'H5589B2FE') {
										plus.webview.close(vi.id, 'auto', 10, false);
									}
								})
								// 跳转到登陆页面
								mui.openWindow({
									url: '/login.html',
									id: 'login.html',
									styles: {
										top: '0px',
										bottom: '0px',
									}
								});
							}
						});
					}
					if(data.data.status == '未认证') {
						mui.confirm('正在认证,请在认证通过后再登录,认证通过后你将收到短信通知', '猛戳商家版', ['确定'], function() {
							// 清空本地存储
							window.localStorage.clear();
							plus.webview.all().forEach(function(vi) {
								// 打包时 把HBuilder换成manifest.json文件中的appid 
								// H5E21842C
								// HBuilder
								if(vi.id !== 'login.html' && vi.id !== 'H5589B2FE') {
									plus.webview.close(vi.id, 'auto', 10, false);
								}
							})
							// 跳转到登陆页面
							mui.openWindow({
								url: '/login.html',
								id: 'login.html',
								styles: {
									top: '0px',
									bottom: '0px',
								},
							});
						});
					}
					if(data.data.status == '认证拒绝') {
						mui.confirm('请重新上传认证', '猛戳商家版', ['确定', '退出'], function(e) {
							if(e.index == 0) {
								mui.openWindow({
									url: '/web/business_legalize/legalize_tis.html',
									id: 'legalize_tis.html',
									styles: {
										top: '0px',
										bottom: '51px',
									},
									createNew: true,
								});
							} else {
								// 清空本地存储
								window.localStorage.clear();
								plus.webview.all().forEach(function(vi) {
									// 打包时 把HBuilder换成manifest.json文件中的appid 
									// H5E21842C
									// HBuilder
									if(vi.id !== 'login.html' && vi.id !== 'H5589B2FE') {
										plus.webview.close(vi.id, 'auto', 10, false);
									}
								})
								// 跳转到登陆页面
								mui.openWindow({
									url: '/login.html',
									id: 'login.html',
									styles: {
										top: '0px',
										bottom: '0px',
									},
								});
							}
						});
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				}
			},
			error: function(XMLHttpRequest, status) {
				toast(3, "关闭loading");
				if(status == 'timeout') {
					plus.nativeUI.toast("连接超时,请重试");
				} else {
					plus.nativeUI.toast("连接出错,请重试");
				}
			}
		});
	},
	// 全局AJAX处理
	initAjax: function() {
		$.ajaxSetup({
			timeout: 10000
		});
		$(document).ajaxError(function(XMLHttpRequest, status) {
			toast(3, "关闭loading");
			plus.nativeUI.closeWaiting();
			if(status == 'timeout') {
				plus.nativeUI.toast("连接超时,请重试");
			} else {
				plus.nativeUI.toast("连接出错,请重试");
			}
		});
	},
}

mMain.initAjax();

Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份   
		"d+": this.getDate(), //日   
		"h+": this.getHours(), //小时   
		"m+": this.getMinutes(), //分   
		"s+": this.getSeconds(), //秒   
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
		"S": this.getMilliseconds() //毫秒   
	};
	if(/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}