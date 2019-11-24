var storage = null;
//银行名称
var bankNames = new Array();
//银行id
var bankIds = new Array();
//当前选中的银行id
var chooseBankId = -1;

mui.init();
mui.plusReady(function() {
	
	mui.ready(function() {
		storage = window.localStorage;

		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});
		getBusinessBankInformation();

		// 绑定设置按钮点击事件
		mui('.fhandle').on('tap', '.fsubmit', function() {
			settingBankCard();
		})

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getBusinessBankInformation();
		});
	});

	//获取商家银行卡信息
	function getBusinessBankInformation() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessBankCard",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				if(data.status == 0) {
					toast(3, "关闭loading");
					var bank_id = data.data.bank_id;
					chooseBankId = bank_id;
					if(bank_id != -1) {
						document.getElementById("selectBank").value = data.data.bank_name;
						document.getElementById("bank_card_number").value = data.data.bank_card_number;
						document.getElementById("real_name").value = data.data.real_name;
					}
					getSuppertBank();
				} else {
					toast(1, data.msg);
				}
			},
		});
	}

	//设置银行卡信息
	function settingBankCard() {
		var bank_card_number = document.getElementById("bank_card_number").value;
		var real_name = document.getElementById("real_name").value;
		if(chooseBankId == -1) {
			toast(1, "请选择银行");
		} else if(bank_card_number == undefined || bank_card_number == "") {
			toast(1, "请输入银行卡号");
		} else if(real_name == undefined || real_name == "") {
			toast(1, "请输入卡户姓名");
		} else {
			toast(2, "开启loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/setWnkBusinessBankCard",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"bank_id": chooseBankId,
					"bank_card_number": bank_card_number,
					"real_name": real_name
				},
				success: function(data) {
					if(data.status == 0) {
						toast(1, data.msg);
					} else if(data.status == 2) {
						mMain.gotoLogin();
					} else {
						toast(1, data.msg);
					}
				},
			});
		}
	}

});

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
			if(data.status == 0) {
				toast(3, "关闭loading");
				var banks = data.data.list;
				for(var index = 0; index < banks.length; index++) {
					var obj = banks[index];
					bankNames.push(obj.name);
					bankIds.push(obj.bank_id);
				}
				console.log(bankNames);
				initBankList();
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
			}
		},
	});
}

//初始化银行选择列表
function initBankList() {
	$("#selectBank").picker({
		title: "请选择开户行",
		cols: [{
			textAlign: 'center',
			values: bankNames
		}],
		onChange: function(p, v, dv) {
			for(var index = 0; index < bankNames.length; index++) {
				var text = bankNames[index];
				if(text == dv) {
					chooseBankId = bankIds[index];
					return;
				}
			}
		},
		onClose: function(p, v, d) {

		}
	})
}

//银行卡号输入监听
function bankCardNumberinputChange(bank_card_number) {
	if(bank_card_number.length > 19) {
		document.getElementById("bank_card_number").value = bank_card_number.slice(0, 19);
	}
}