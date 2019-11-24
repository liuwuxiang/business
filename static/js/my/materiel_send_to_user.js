var storage = null;
//物料列表
var materiel_list = null;

mui.init();
mui.plusReady(function() {
	mui.ready(function() {

		storage = window.localStorage;

		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});
		getAllExtensionMaterielByBusinessId();

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getAllExtensionMaterielByBusinessId();
		});

	});
	//获取商家的推广物料
	function getAllExtensionMaterielByBusinessId() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$("#wnk_buy_meal_div label").remove();
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getAllExtensionMaterielByBusinessId",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {

				if(data.status == 0) {
					toast(3, data.msg);
					materiel_list = data.data;
					for(var index = 0; index < materiel_list.length; index++) {
						var obj = materiel_list[index];
						var html = "<label class=\"fradio level_label\">" +
							"<div class=\"level_div\">" +
							"<a>" + obj.materiel_name + "(剩余:" + obj.surplus_number + "张)</a>" +
							"</div>" +
							"<input type=\"radio\" name=\"card_type\" id=\"materiel_" + obj.materiel_id + "\">" +
							"<span class=\"status\"></span>" +
							"</label>";
						$("#wnk_buy_meal_div").append(html);
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

});

//同意办理等级升级
function arrgenHandelLevel() {
	if(materiel_list == null || materiel_list == undefined) {
		mui.toast("暂无物料");
		return;
	}
	var materiel_id = -1;
	var user_mobile = document.getElementById("user_mobile").value;
	var gitf_number = document.getElementById("gift_number").value;
	
	for(var index = 0; index < materiel_list.length; index++) {
		var obj = materiel_list[index];
		var radio = document.getElementById("materiel_" + obj.materiel_id);
		if(radio.checked) {
			materiel_id = obj.materiel_id;
			continue;
		}
	}
	if(user_mobile == undefined || user_mobile == "") {
		mui.toast("请填写用户手机号");
	} else if(user_mobile.length != 11) {
		mui.toast("手机号不合法");
	} else if(gitf_number == undefined || gitf_number == "") {
		mui.toast("请选择赠送数量");
	} else if(materiel_id == -1) {
		mui.toast("请选择一个物料");
	} else {
		mui.prompt('请填写支付密码进行验证', '请填写支付密码进行验证', '支付密码', ['取消', '确定'], function(e) {
			if(e.index == 1) {
				if(e.value == undefined || String(e.value) == '') {
					mui.toast("请输入支付密码");
				} else {
					
					wnkBusinessSendMaterielToUser(user_mobile, materiel_id, e.value , gitf_number);
				}
			}
		}, 'div')
		document.querySelector('.mui-popup-input input').type = 'password'
	}
}

//获取商家的推广物料
function wnkBusinessSendMaterielToUser(user_mobile, materiel_id, pay_pwd, gitf_number) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/wnkBusinessSendMaterielToUser",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"user_mobile": user_mobile,
			"materiel_id": parseInt(materiel_id),
			"pay_pwd": pay_pwd,
			"gitf_number": gitf_number
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
				mui.toast(data.msg);
			}
		}
	});
}