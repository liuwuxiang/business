var storage = null;
//当前是否可获取验证码(0-可获取,1-不可获取)
var getCodeState = 0;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	mui.ready(function() {
		document.getElementById('getMobileCode').addEventListener('tap', getMobileCode);
		document.getElementById('setPayPwd').addEventListener('tap', setPayPwd);
	});

	// 防止手机弹出输入法是tar跟着跑
	plus.webview.currentWebview().setStyle({
		height: 'd'
	});

	var storage = window.localStorage;

	/*
	 *	获取短信验证码
	 * */
	function getMobileCode() {
		if(getCodeState == 0){
			toast(2, "开启loading");
			var time = 60;
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + '/wnk_business_app/v1.0.0/getMobileCodeSetPwd',
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"type": '10'
				},
				success: function(data) {
					toast(3, "关闭loading");
					if(data.status == 0) {
						toast(0, "获取成功");
						getCodeState = 1;
						document.getElementById("getMobileCode").style.color = "#808080";
		                    var timer = setInterval(function () {
				                if(time == 0){
				                		getCodeState = 0;
				                		document.getElementById("getMobileCode").style.color = "#0b8ffe";
				                    document.getElementById("getMobileCode").innerText = "重新发送";
				                    clearInterval(timer);
				                }else {
				                    document.getElementById("getMobileCode").innerText = time+"s";
				                    time--;
				                }
				            },1000);
					} else if(data.status == 2) {
						mMain.gotoLogin();
					} else {
						mui.toast(0, data.msg);
					}
				},
			});
		}
	}

	//设置的支付密码
	function setPayPwd() {
		var new_pwd = document.getElementById("new_pwd").value;
		var confirm_new_pwd = document.getElementById("confirm_new_pwd").value;
		var code = document.getElementById("code").value;
		if(new_pwd == undefined || new_pwd == "") {
			mui.toast("请输入新密码");
		} else if(confirm_new_pwd == undefined || confirm_new_pwd == "") {
			mui.toast("请再次输入新密码");
		} else if(new_pwd != confirm_new_pwd) {
			mui.toast("两次输入的密码不一致");
		} else if(code == undefined || code == "") {
			mui.toast("请输入验证码");
		} else {
			toast(2, "开启loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/setPwdPwd",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"new_pay_pwd": confirm_new_pwd,
					"code": code
				},
				success: function(data) {
					toast(3, "关闭loading");
					toast(1, data.msg);
					if(data.status == 0) {
						mMain.back();
					} else if(data.msg == 1) {
						mMain.gotoLogin();
					} else {
						mui.toast(data.msg);
					}
				},
			});
		}

	}
});