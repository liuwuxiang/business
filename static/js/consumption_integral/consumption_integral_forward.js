var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function(){
	
	mui.ready(function(){
		storage = window.localStorage;
		// 防止手机弹出输入法是tar跟着跑
 		plus.webview.currentWebview().setStyle({height:'d'});
	});
	
});

//兑换申请
function submitWithdraw() {
    var withdraw_number = document.getElementById("withdraw_number").value;
    if (withdraw_number == undefined || withdraw_number == ""){
        toast(1,"请输入兑换积分个数");
    }
    else if (withdraw_number % 100 != 0){
        toast(1,"兑换积分个数需为100的整数倍");
    }
    else{
        toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/wnkBusinessConsumptionIntegralExchange",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"integral_number" : withdraw_number
			},
			success: function(data) {

				if(data.status == 0) {
					toast(3, data.msg);
					
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
    var count_amount = number * 0.01;
    document.getElementById("count_amount").innerHTML    = count_amount;
    document.getElementById("receipts_amount").innerHTML = count_amount;
}