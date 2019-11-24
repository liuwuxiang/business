var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;
		optionClick(0);
		mui('.wrap').on('tap', '.item', function() {
			var id = this.getAttribute('id');
			String(id) == 'income_a' ? optionClick(0) : optionClick(1);
		});
		document.getElementById('joinWithdraw').addEventListener('tap', joinWithdraw);
		document.getElementById('joinRecharge').addEventListener('tap', joinRecharge);
		
		
		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			optionClick(0);
		});
		
		mui('#money_detail_ul').on('tap','li',function(){
			var id = this.getAttribute('id');
			// 如果为提现订单
			if(parseInt(this.getAttribute('name')) === 0 ){
				mui.openWindow({
					url: '/web/my/account_balance_withdraw_info.html',
					id: 'account_balance_withdraw_info.html',
					styles: {
						top: '0px',
						bottom: '51px',
					},
					createNew: true, 
					extras: {
						withdraw_id : id
					}
				});
			}
		})
	});

	//选项卡事件(0-收入,1-支出)
	function optionClick(index) {
		if(index == 0) {
			document.getElementById("income_a").setAttribute("class", "item sel");
			document.getElementById("expenditure_a").setAttribute("class", "item");
			getDetailData(index);
		} else {
			document.getElementById("expenditure_a").setAttribute("class", "item sel");
			document.getElementById("income_a").setAttribute("class", "item");
			getDetailData(index);
		}
	}

	//进入提现页面
	function joinWithdraw() {
		mui.openWindow({
			url: './amount_withdraw.html',
			id: 'amount_withdraw.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			createNew: true,
		});
	}

	//进入余额充值界面
	function joinRecharge() {
		mui.openWindow({
			url: './account_balance_recharge.html',
			id: 'account_balance_recharge.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			createNew: true,
		});
	}

	//获取详情数据
	function getDetailData(type) {
		toast(2, "打开loading");
		var className = "";
		var fuhao = "-";
		if(type == 0) {
			className = "income_money";
			fuhao = "+";
		} else {
			className = "income_money expenditure_amount";
			fuhao = "-";
		}
		$("#money_detail_ul li").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getBalanceDetail",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"type": type
			},
			success: function(data) {
				toast(3, "关闭loading"); 
				if(data.status == 0) {
					document.getElementById("account_balance_value").innerText = data.data.balance;
					var list = data.data.detail;
					if(list.length <= 0) {
						toast(1, "暂无记录");
					} else {
						for(var index = 0; index < list.length; index++) {
							var obj = list[index];
							var html = "<li id=" + obj.withdraw_id + " name=" + obj.is_withdraw + " >" +
								"<div class=\"li_top_div\">" +
								"<a class=\"detail_name\">" + obj.name + "</a>" +
								"<a class=\"" + className + "\">" + fuhao + obj.transaction_amount + "</a>" +
								"</div>" +
								"<div class=\"li_bottom_div\">" +
								"<a class=\"detail_time\">" + obj.state_str + " " + obj.join_time_str + "</a>" +
								"<a class=\"detail_balance\">余额：" + obj.after_balance + "</a>" +
								"</div>" +
								"</li>";
							$("#money_detail_ul").append(html);
						}
			
						
					}

				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//获取支出数据
	function getPayData(type) {
		toast(2, "打开loading");
		var className = "";
		var fuhao = "-";
		if(type == 0) {
			className = "income_money";
			fuhao = "+";
		} else {
			className = "income_money expenditure_amount";
			fuhao = "-";
		}
		$("#money_detail_ul li").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getBusinessWithdrawRecord",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					document.getElementById("account_balance_value").innerText = data.data.balance;
					var list = data.data.detail;
					if(list.length <= 0) {
						toast(1, "暂无记录");
					} else {
						for(var index = 0; index < list.length; index++) {
							var obj = list[index];
							var html = "<li>" +
								"<div class=\"li_top_div\">" +
								"<a class=\"detail_name\">提现</a>" +
								"<a class=\"" + className + "\">" + fuhao + obj.rmb_count_amount + "</a>" +
								"</div>" +
								"<div class=\"li_bottom_div\">" +
								"<a class=\"detail_time\">" + obj.apply_date_str + "</a>" +
								"<a class=\"detail_balance\">状态：" + obj.state_str + "</a>" +
								"</div>" +
								"</li>";
							$("#money_detail_ul").append(html);
						}
					}

				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}


});