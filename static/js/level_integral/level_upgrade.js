var storage = null;
var level_list = null;

mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;

		mui.confirm('老子:夫唯弗居，是以不去。','合同条款',['取消','确定'],function(e){
			if(e.index == 0){
				mMain.back();
			}
		},'div');

		getWnkBusinessAllLevel();

		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});


		
		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getWnkBusinessAllLevel();
		});
	});

	//获取商家所有可选的等级
	function getWnkBusinessAllLevel() {
		toast(2, "打开loading");
		$("#wnk_buy_meal_div label").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessAllLevel",
			type: "POST", 
			dataType: 'json',
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				console.log(JSON.stringify(data));
				if(data.status == 0) {
					toast(3, data.msg);
					level_list = data.data;
					for(var index = 0; index < level_list.length; index++) {
						var obj = level_list[index];
						var html = "<label class=\"fradio level_label\">" +
							"<div class=\"level_div\">" +
							"<a>" + obj.level_name + "</a>" +
							"<a>有效期：" + obj.term_validity + "月</a>" +
							"<a>价格：" + obj.price + "元</a>" +
							"<a>可获积分：" + obj.obtain_integral + "积分</a>" +
							"</div>" +
							"<input type=\"radio\" name=\"card_type\" id=\"cjcard_radio_" + obj.id + "\">" +
							"<span class=\"status\"></span>" +
							"</label>";
						$("#wnk_buy_meal_div").append(html);
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(1, data.msg);
				}
			}
		});
	}
});

//同意办理等级升级
function arrgenHandelLevel() {
	var level_id = -1;
	var wx_pay_radio = document.getElementById("wx_pay_radio");
	var yue_pay_radio = document.getElementById('yue_pay_radio');
	//0-微信支付
	pay_way = -1;
	for(var index = 0; index < level_list.length; index++) {
		var obj = level_list[index];
		var radio = document.getElementById("cjcard_radio_" + obj.id);
		if(radio.checked) {
			level_id = obj.id;
			continue;
		}
	}

	// 判断支付方式是哪个, 0 微信  1 余额
	if(wx_pay_radio.checked) {
		pay_way = 0;
	}
	if(yue_pay_radio.checked) {
		pay_way = 1;
	}

	if(level_id == -1) {
		toast(1, "请选择一个等级");
	} else if(pay_way == -1) {
		toast(1, "请选择支付方式");
	} else if(pay_way == 0) {
		levelUpgradeWXPay(level_id);
	} else {
		levelUpgradeBalancePay_pay_pwd(level_id);
	}
}

//等级升级-微信支付
function levelUpgradeWXPay(level_id) {
	toast(2, "打开loading");
	var url = mMain.url + '/wnk_business_app/v1.0.0/wnkBusinessUpgradeLevelLineOrder?business_id=' + storage["business_id"] + "&level_id=" + level_id;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		switch(xhr.readyState) {
			case 4:
				if(xhr.status == 200) {
					console.log("请求订单成功");
					var order = xhr.responseText;
					plus.payment.request("wxpay", order, function(result) {
						console.log("支付成功");
						toast(1, "支付成功");
					}, function(e) {
						console.log("支付失败");
						toast(1, "商户号该产品权限未开通");
					});
				} else {
					console.log("请求订单失败");
					toast(1, "获取订单信息失败");
				}
				break;
			default:
				break;
		}
	}
	xhr.open('GET', url);
	console.log('请求支付订单：' + url);
	xhr.send();
}

function levelUpgradeBalancePay_pay_pwd(leve_id) {
	mui.prompt('请填写支付密码进行验证', '请填写支付密码进行验证', '支付密码', ['取消', '确定'], function(e) {
		if(e.index == 1) {
			if(e.value == undefined || String(e.value) == '') {
				mui.toast("请输入支付密码");
			} else {
				levelUpgradeBalancePay(leve_id, e.value);
			}
		}
	}, 'div')
	document.querySelector('.mui-popup-input input').type = 'password'
}

//等级升级-余额支付
function levelUpgradeBalancePay(level_id, pay_pwd) {
	toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/wnkBusinessUpgradeLevelLineOrderByBalance",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"level_id":level_id,
				"pay_text":pay_pwd
			},
			success: function(data) {

				if(data.status == 0) {
					toast(1, data.msg);
					mMain.back();
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(1, data.msg);
				}
			}
		});
}