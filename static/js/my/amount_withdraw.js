var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {

	//此处值表示多少个通用积分可以兑换一元人民币
	var tyandrmb = 1000;
	//通用积分􏰀现手续费
	var tytxfl = 10;
	//可􏰀提现时间段
	var withdraw_time_slot = "";
	//银行名称
	var bankNames = new Array();
	//银行id
	var bankIds = new Array();
	//当前选中的银行id
	var chooseBankId = -1;

	var picker = null;

	mui.ready(function() {
		storage = window.localStorage;
		getWithdrawInformation();
		getSuppertBank();
		document.getElementById('submitWithdraw').addEventListener('tap', submitWithdraw);
		document.getElementById('withdraw_number').addEventListener('input', function() {
			inputChange(this.value);
		});
		document.getElementById('bank_card_number').addEventListener('input', function() {
			bankCardNumberinputChange(this.value);
		});
		document.getElementById('selectBank').addEventListener('click', function() {
			document.activeElement.blur();
			var data = [];
			for(var i = 0; i < bankNames.length; i++) {
				data.push({
					value: bankIds[i],
					text: bankNames[i]
				});
			}
			var picker = new mui.PopPicker();
			picker.setData(data);
			picker.show(function(e) {
				var value = e[0].value;
				var text = e[0].text;
				chooseBankId = value;
				document.getElementById('selectBank').value = text;
			})
		});
		
		window.addEventListener('keydownClose', function(event) { // 从别个页面返回时触发
			getWithdrawInformation();
			getSuppertBank();
		});
	});
	// 防止手机弹出输入法是tar跟着跑
	plus.webview.currentWebview().setStyle({
		height: 'd'
	});

	//获取提现限制信息
	function getWithdrawInformation() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/app/v1.0.0/getSubscriptionRatioInformationTwo",
			type: "POST",
			dataType: 'json',
			data: {type:0},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					tyandrmb = data.data.tyandrmb;
					tytxfl = data.data.tytxfl; 
					withdraw_time_slot = data.data.withdraw_time_slot;
					document.getElementById("withdraw_tip").innerHTML = "1.提现申请时间为:" + withdraw_time_slot + "<br>2.提现手续费" + tytxfl + "%";
					document.getElementById('min_number').innerHTML = data.data.withdraw_min_number != undefined ? data.data.withdraw_min_number : 0;
					document.getElementById('get_time').innerHTML = data.data.withdraw_get_time != undefined ? data.data.withdraw_get_time : 0;
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//获取支持的提现银行
	function getSuppertBank() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/app/v1.0.0/getAllWithdrawSupportBank",
			type: "POST",
			dataType: 'json',
			data: {},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					var banks = data.data.list;
					for(var index = 0; index < banks.length; index++) {
						var obj = banks[index];
						bankNames.push(obj.name);
						bankIds.push(obj.bank_id);
					}

					initBankList();
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//初始化银行选择列表
	function initBankList() {
		var data = [];
		for(var i = 0; i < bankNames.length; i++) {
			data.push({
				value: bankIds[i],
				text: bankNames[i]
			});
		}
		var picker = new mui.PopPicker();
		picker.setData(data);
	}

	//提现个数输入监听
	function inputChange(number) {
		var count_amount = number;
		document.getElementById("receipts_amount").innerHTML = count_amount - count_amount * tytxfl / 100;
	}

	//银行卡号输入监听
	function bankCardNumberinputChange(bank_card_number) {
		if(bank_card_number.length > 19) {
			document.getElementById("bank_card_number").value = bank_card_number.slice(0, 19);
		}
	}

	//提现申请
	function submitWithdraw() {
		var withdraw_number = document.getElementById("withdraw_number").value;
		var bank_card_number = document.getElementById("bank_card_number").value;
		var real_name = document.getElementById("real_name").value;
		if(withdraw_number == undefined || withdraw_number == "") {
			toast(1, "请输入提现金额");
		} else if(chooseBankId == -1) {
			toast(1, "请选择提现银行");
		} else if(bank_card_number == undefined || bank_card_number == "") {
			toast(1, "请输入银行卡号");
		} else if(real_name == undefined || real_name == "") {
			toast(1, "请输入卡户姓名");
		} else {
			mui.prompt('请填写支付密码进行验证', '请填写支付密码进行验证', '支付密码', ['取消', '确定'], function(e) {
			if(e.index == 1) {
				if(e.value == undefined || String(e.value) == '') {
					mui.toast("请输入支付密码");
				} else {
					withdrawAction(withdraw_number, chooseBankId, real_name, bank_card_number, storage["business_id"], e.value);
				}
			}
		}, 'div')
		document.querySelector('.mui-popup-input input').type = 'password';
		}
	}

	//提现网络事件
	function withdrawAction(withdraw_number, chooseBankId, real_name, bank_card_number, business_id, user_pay_pwd) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/businessWithdrawApply",
			type: "POST",
			dataType: 'json',
			data: {
				"withdraw_amount": withdraw_number,
				"bank_id": chooseBankId,
				"bank_card_name": real_name,
				"bank_card_number": bank_card_number,
				"business_id": business_id,
				"user_pay_pwd": user_pay_pwd
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					mui.alert(data.msg,'猛戳商家版',function(){
						mMain.back();
					})
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

});