var storage = null;

// 提现订单ID
var withdraw_id = -1;
mui.init();
mui.plusReady(function(){
	mui.ready(function(){
		// 初始化本地
		storage = window.localStorage;
		// 获取参数
		var self = plus.webview.currentWebview();
		withdraw_id = self.withdraw_id;
		// 查询订单号信息
		selectWithdrawInfoById();
	});
	
	// 根据ID查询提现订单详情
	function selectWithdrawInfoById(){
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/selectWithdrawInfoById",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"withdraw_id": withdraw_id
			},
			success: function(data) {
				toast(3, "关闭loading"); 
				if(data.status == 0) {
					document.getElementById('order_no').innerHTML                = data.data.order_no;
					document.getElementById('out_trade_no').innerHTML            = data.data.out_trade_no == undefined ? '' : data.data.out_trade_no;
					document.getElementById('back_name').innerHTML               = data.data.back_name;
					document.getElementById('bank_card_number').innerHTML        = data.data.bank_card_number.replace(/^(\d{4})\d+(\d{4})$/,"$1 **** **** $2");
					document.getElementById('bank_card_name').innerHTML          = data.data.bank_card_name;
					document.getElementById('rmb_count_amount').innerHTML        = data.data.rmb_count_amount + '元';
					document.getElementById('service_charge_amount').innerHTML   = data.data.service_charge_amount + '元';
					document.getElementById('real_payment_rmb_amount').innerHTML = data.data.real_payment_rmb_amount + '元';
					document.getElementById('state').innerHTML                   = data.data.state_str;
					document.getElementById('apply_date').innerHTML              = data.data.apply_date_str;
					document.getElementById('loan_date').innerHTML               = data.data.loan_date_str == undefined ? '' : data.data.loan_date_str;;
					document.getElementById('remark').innerHTML                  = data.data.remark == undefined ? '' : data.data.remark;
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}
	
});
