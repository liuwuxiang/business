var storage = null;
var pays={};
//物料套餐列表
var materiel_meal_list = [];

//物料id
var materiel_id = -1;

mui.init();
//注意：若为ajax请求，则需将如下代码放在处理完ajax响应数据之后；
mui.plusReady(function() {

	mui.ready(function() {

		storage = window.localStorage;

		document.getElementById('back').addEventListener('tap', mMain.back);
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});

		var self = plus.webview.currentWebview();
		var materiel_name = self.materiel_name; //获得参数
		materiel_id = self.materiel_id; //获得参数
		document.getElementById("top_title_tag").innerHTML = "物料购买-" + materiel_name;

		getMaterielBuyMealByMaterielId();

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getMaterielBuyMealByMaterielId();
		});
	})
	//获取所有可选套餐
	function getMaterielBuyMealByMaterielId() {
		toast(2, "打开loading");
		$("#wnk_buy_meal_div label").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getMaterielBuyMealByMaterielId",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"materiel_id": materiel_id
			},
			success: function(data) {

				if(data.status == 0) {
					toast(3, data.msg);
					materiel_meal_list = data.data.list;
					for(var index = 0; index < materiel_meal_list.length; index++) {
						var obj = materiel_meal_list[index];
						var html = "<label class=\"fradio level_label\">" +
							"<div class=\"level_div\">" +
							"<a>" + obj.price + "元-" + obj.number + "张</a>" +
							"</div>" +
							"<input type=\"radio\" name=\"card_type\" id=\"materiel_meal_" + obj.id + "\">" +
							"<span class=\"status\"></span>" +
							"</label>";
						$("#wnk_buy_meal_div").append(html);
					}
					var limit_times = data.data.limit_times;
					if(limit_times == 0){
						var buy_number_finish = data.data.buy_number_finish;
						var buy_number = data.data.buy_number;
						if(buy_number_finish == 0){
							mui.confirm('此物料限制购买'+buy_number+"次,你已用完", '购买提示:', ['确定'], function(e) {
						
							}, 'div');
						}
						else{
							var buy_success_number = data.data.buy_success_number;
							var is_wnk = data.data.is_wnk;
							if(is_wnk == 1){
								mui.confirm('公司为了支持商家能够快速锁客和回收资金，现限量500个商户低价售卖，仅限购买'+buy_number+"次,机会有限，谨慎选择", '购买提示:', ['确定'], function(e) {
						
								}, 'div');
							}
							else{
								mui.confirm('此物料限制购买'+buy_number+"次,你已购买"+buy_success_number+"次", '购买提示:', ['确定'], function(e) {
						
								}, 'div');
							}
						}
					}
					
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(3, data.msg);
					mui.toast(data.msg);
				}
			}
		});
	}
})

//同意办理等级升级
function arrgenHandelLevel() {

	var materiel_meal_id = -1;
	var wx_pay_radio = document.getElementById("wx_pay_radio");
	var balance_pay_radio = document.getElementById("balance_pay_radio");
	//0-微信支付,1-余额支付
	pay_way = -1;
	for(var index = 0; index < materiel_meal_list.length; index++) {
		var obj = materiel_meal_list[index];
		var radio = document.getElementById("materiel_meal_" + obj.id);
		if(radio.checked) {
			materiel_meal_id = obj.id;
			continue;
		}
	}
	if(wx_pay_radio.checked) {
		pay_way = 0;
	} else if(balance_pay_radio.checked) {
		pay_way = 1;
	}
	if(materiel_meal_id == -1) {
		mui.toast("请选择一个套餐");
	} else if(pay_way == -1) {
		mui.toast("请选择支付方式");
	} else {
		if(pay_way == 0) {
			materielMealBuyWXPay(materiel_meal_id);
		} else {
			levelUpgradeBalancePay_pay_pwd(materiel_meal_id);
		}
	}
}

function levelUpgradeBalancePay_pay_pwd(materiel_meal_id) {
	mui.prompt('请填写支付密码进行验证', '请填写支付密码进行验证', '支付密码', ['取消', '确定'], function(e) {
		if(e.index == 1) {
			if(e.value == undefined || String(e.value) == '') {
				mui.toast("请输入支付密码");
			} else {
				
				materielMealBuyBalancePay(materiel_meal_id, e.value);
			}
		}
	}, 'div')
	document.querySelector('.mui-popup-input input').type = 'password'
}

//物料套餐购买余额支付
function materielMealBuyBalancePay(materiel_meal_id, pay_pwd) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/wnkBusinessBuyMaterielMealBalancePay",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"materiel_meal_id": materiel_meal_id,
			"pay_text": pay_pwd
		},
		success: function(data) {

			if(data.status == 0) {
				toast(3, data.msg);
				mui.toast(data.msg);
				mMain.back();
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(3, data.msg);
				mui.confirm(data.msg, '购买提示:', ['确定'], function(e) {
						
				}, 'div');
			}
		}
	});
}

//物料套餐购买微信支付
function materielMealBuyWXPay(materiel_meal_id) {
	toast(2,"打开loading");
		$.ajax({
	    		url:mMain.url + '/wnk_business_app/v1.0.0/wnkBusinessBuyMaterielMealWXPay',
			type:"POST",
			dataType : 'json',
			data:{
			     "business_id" : storage["business_id"],
			      "materiel_meal_id" : materiel_meal_id
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
								mMain.back();
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