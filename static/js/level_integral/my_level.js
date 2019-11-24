var storage = null;
var pays={};

mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {

	mui.ready(function() {
		plus.webview.close(plus.webview.getWebviewById('protocol.html'),'none');
		storage = window.localStorage;
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});
		getAccountBalance();
		getWnkBusinessAllLevel();
		// 帮助说明点击事件
		mui('.head').on('tap', '.submit', function() {
			mui.openWindow({
				url: '../my/integral.html',
				id: 'integral.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				extras: {
					'type' : 1
				},
				createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
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

/**
	 * 获取账户余额
	 */
function getAccountBalance() {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getBalance",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {

			if(data.status == 0) {
				toast(3, data.msg);
				// 商家等级名称
				document.getElementById("business_level").innerHTML = data.data.level_name;
				// 到期时间
				document.getElementById("level_term_date").innerHTML = "到期时间:"+data.data.level_term_date;
			} else {
				toast(0,data.msg);
			}
		}
	});
}

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
	} 
	else{
		if(pay_way == 0) {
			levelUpgradeWXPay(level_id);
		} else {
			levelUpgradeBalancePay_pay_pwd(level_id);
		}
	}
}

//等级升级-微信支付
function levelUpgradeWXPay(level_id) {
	toast(2,"打开loading");
		$.ajax({
	    		url:mMain.url + '/wnk_business_app/v1.0.0/wnkBusinessUpgradeLevelLineOrder',
			type:"POST",
			dataType : 'json',
			data:{
			     "business_id":storage["business_id"],
			     "level_id":level_id
			},
			success:function(data){
			     if (data.status == 0){
			        toast(3,"关闭");
			        var config = data.data;
			        console.log(config);
			        // 获取支付通道
					plus.payment.getChannels(function(channels){
						for(var i in channels){
							var channel=channels[i];
							if(channel.id=='wxpay'){	// 过滤掉不支持的支付通道：暂不支持360相关支付
								pays[channel.id]=channel;
							}			
						}
						if(pays.length <= 0){
							toast(1,"暂不可支付");
						}
						else{
							plus.payment.request(pays["wxpay"],config,function(result){
								console.log("支付成功");
								toast(1,"支付成功");
								getAccountBalance();
							},function(e){
								console.log(JSON.stringify(e));
								toast(1,"用户取消支付");
							});
						}
								
					},function(e){
						toast(1,"用户取消支付");
					});
			        }
			     else if(data.status == 2){
			            storage["user_id"] = "";
			            toast(1,data.msg);
			            joinLoginPage();
			    }
			    else{
			           toast(1,data.msg);
			    }
			},
	});
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
//					mMain.back();
					getAccountBalance();
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(1, data.msg);
				}
			}
		});
}