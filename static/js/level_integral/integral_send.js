var storage = null;
var level_list = null;
//积分类型(0-兑换积分,1-赠送积分)
var integral_type = -1;

mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});
		
		// 绑定积分类型按钮事件
		mui('.integral_type_div').on('tap', 'a', function() {
			var typeId = this.getAttribute('id');
			if(typeId == 'exchange_integral_tag'){
				document.getElementById("exchange_integral_img").src = "../../static/images/wnk_business/checked.png";
				document.getElementById("send_integral_img").src = "../../static/images/wnk_business/no_check.png";
				integral_type = 0;
			}
			else{
				document.getElementById("send_integral_img").src = "../../static/images/wnk_business/checked.png";
				document.getElementById("exchange_integral_img").src = "../../static/images/wnk_business/no_check.png";
				integral_type = 1;
			}
		})

	});

});

//同意办理等级升级
function arrgenHandelLevel() {

	var user_mobile = document.getElementById("user_mobile").value;
	var withdraw_number = document.getElementById("withdraw_number").value;

	var level_id = -1;
	var wx_pay_radio = document.getElementById("wx_pay_radio");
	var yue_pay_radio = document.getElementById('yue_pay_radio');
	//0-微信支付
	var pay_way = -1;
	// 判断支付方式是哪个, 0 积分  1 余额
	if(wx_pay_radio.checked) {
		pay_way = 0;
	}
	if(yue_pay_radio.checked) {
		pay_way = 1;
	}

	if(user_mobile == undefined || user_mobile == "") {
		toast(1, "请输入用户手机号");
		return;
	}
	if(integral_type == -1){
		toast(1, "请选择积分类型");
		return;
	}
	if(withdraw_number == undefined || withdraw_number == "") {
		toast(1, "请输入赠送积分个数");
		return;
	}
	if(withdraw_number <= 0) {
		toast(1, "赠送积分个数不可小于等于0");
		return;
	}

	if(pay_way == -1) {
		toast(1, "请选择支付方式");
		return ;
	}  
	if(pay_way == 0) {
		mui.prompt('请填写支付密码进行验证', '请填写支付密码进行验证', '支付密码', ['取消', '确定'], function(e) {
			if(e.index == 1) {
				if(e.value == undefined || String(e.value) == '') {
					mui.toast("请输入支付密码");
				} else {
					submitWithdraw(withdraw_number,user_mobile,e.value);
				}
			}
		}, 'div')
		document.querySelector('.mui-popup-input input').type = 'password';
	} else {
		levelUpgradeBalancePay_pay_pwd(withdraw_number,user_mobile);
	}
}

//积分赠送
function submitWithdraw(withdraw_number,user_mobile,pay_pwd) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/wnkBusinessSendIntegralToUser",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id"    : storage["business_id"],
			"integral_number": withdraw_number,
			"user_mobile": user_mobile,
			"pay_pwd":pay_pwd,
			"integral_type":integral_type
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status == 0) {
				toast(1, data.msg);
				mMain.back();
			} else {
				toast(1, data.msg);
			}
		},
		error : function(a){
			console.log(JSON.stringify(a));
		}
	});
}

//提现个数输入监听
function inputChange(number) {
	document.getElementById("receipts_amount").innerHTML = number;
	document.getElementById("pay_integral").innerHTML = number;
	document.getElementById("pay_balance_amount").innerHTML = number * 0.1;
}


function levelUpgradeBalancePay_pay_pwd(withdraw_number,user_mobile) {
	mui.prompt('请填写支付密码进行验证', '请填写支付密码进行验证', '支付密码', ['取消', '确定'], function(e) {
		if(e.index == 1) {
			if(e.value == undefined || String(e.value) == '') {
				mui.toast("请输入支付密码");
			} else {
				levelUpgradeBalancePay(withdraw_number,user_mobile, e.value);
			}
		}
	}, 'div')
	document.querySelector('.mui-popup-input input').type = 'password'
}

//等级升级-余额支付
function levelUpgradeBalancePay(withdraw_number,user_mobile, pay_pwd) {
	toast(2, "打开loading");
	var url = mMain.url + '/wnk_business_app/v1.0.0/wnkBusinessSendIntegralToUserByBalancePay';
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		console.log(xhr.responseText);
		if(xhr.readyState == 4 && xhr.status == 200) {
			var ret = JSON.parse(xhr.responseText);
			console.log(JSON.stringify(ret));
			if(ret.status == 0) {
				toast(0, ret.msg);
				mMain.back();
			} else {
				toast(0, ret.msg);
			}
		}
	}
	xhr.open('POST', url);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send('business_id=' + storage["business_id"] + "&user_mobile=" + user_mobile + "&integral_number=" + withdraw_number+ "&pay_pwd=" + pay_pwd+"&integral_type=" + integral_type);
}

//支付事件选择type=0-积分支付,type=1-余额支付
function choosePayWay(type){
	if(type == 0){
		$("#integral_pay").show();
		$("#balance_pay").hide();
	}
	else{
		$("#integral_pay").hide();
		$("#balance_pay").show();
	}
}
