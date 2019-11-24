var storage = null;
var pays={};
mui.init();
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});
	});

});

//提现个数输入监听
function inputChange(number) {
	document.getElementById("receipts_amount").innerHTML = number;
}

//同意办理等级升级
function arrgenHandelLevel() {
	var wx_pay_radio = document.getElementById("wx_pay_radio");
	var withdraw_number = document.getElementById("withdraw_number").value;
	//0-微信支付
	pay_way = -1;
	if(wx_pay_radio.checked) {
		pay_way = 0;
	}
	if(withdraw_number == undefined || withdraw_number == "") {
		toast(1, "请输入充值金额");
	} else if(withdraw_number <= 0.00) {
		toast(1, "充值金额不可小于0");
	} else if(pay_way == -1) {
		toast(1, "请选择支付方式");
	} else {
		rechargeWXPay(withdraw_number);
	}
}

//余额充值-微信支付
function rechargeWXPay(withdraw_number) {
	toast(2,"打开loading");
	jQuery.support.cors = true;
	$.ajax({
	    		url:mMain.url + '/wnk_business_app/v1.0.0/wnkBusinessRechargeLineOrder',
			type:"POST",
			dataType : 'json',
			data:{
			     "business_id" : storage["business_id"],
			      "amount" : withdraw_number
			},
			success:function(data){
			     if (data.status == 0){
			        toast(3,"关闭");
			        var config = data.data;
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
			}
	});
}