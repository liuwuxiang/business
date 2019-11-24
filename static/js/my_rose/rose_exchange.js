
//玫瑰与人民币兑换比例(多少玫瑰兑换1元人民币)
var rose_rmb_proprotion = 0;
var storage = null;

mui.init();
mui.plusReady(function(){
	mui.ready(function(){
		storage = window.localStorage;
		// 防止手机弹出输入法是tar跟着跑
 		plus.webview.currentWebview().setStyle({height:'d'});
 		getRoseAndRMBExchangeProportion();
 		
 		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getRoseAndRMBExchangeProportion();
		});
		
	});
	
	//获取玫瑰与人民币兑换比例
	function getRoseAndRMBExchangeProportion() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getRoseAndRMBExchangeProportion",
			type: "POST",
			dataType: 'json',
			data: {},
			success: function(data) {
	
				if(data.status == 0) {
					toast(3, data.msg);
					rose_rmb_proprotion = data.data.rose_rmb_proprotion;
					if(rose_rmb_proprotion == 0){
						toast(1,"当前不可兑换");
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					rose_rmb_proprotion = 0;
					toast(1,data.msg);
				}
			}
		});
	}
});

//提现申请
function submitWithdraw() {
    var withdraw_number = document.getElementById("withdraw_number").value;
    if (withdraw_number == undefined || withdraw_number == ""){
        toast(1,"请输入玫瑰兑换个数");
    }
    else{
        toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/wnkBusinessRoseExchangeRMB",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"rose_number": withdraw_number
			},
			success: function(data) {
				console.log(JSON.stringify(data));
				if(data.status == 0) {
					plus.nativeUI.confirm(data.msg,function(){
						mMain.back();
					},{title:'猛戳商家版',buttons:['确定']});
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(1,data.msg);
				}
			}
		});
    }
}

//提现个数输入监听
function inputChange(number) {
	if(rose_rmb_proprotion <= 0){
	    document.getElementById("count_amount").innerHTML    = 0;
	    document.getElementById("receipts_amount").innerHTML = 0;
	}
	else{
		var count_amount = number / rose_rmb_proprotion;
	    document.getElementById("count_amount").innerHTML    = count_amount;
	    document.getElementById("receipts_amount").innerHTML = count_amount;
	}
}