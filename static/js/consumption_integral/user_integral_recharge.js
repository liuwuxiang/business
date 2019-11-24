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

//充值提交
function submitRecharge() {
	var user_mobile = document.getElementById("user_mobile").value;
    var withdraw_number = document.getElementById("withdraw_number").value;
    if(user_mobile == undefined || user_mobile == ""){
    		toast(1,"请输入用户手机号");
    }
    else if(user_mobile.length != 11){
    		toast(1,"用户手机号不合法");
    }
    else if (withdraw_number == undefined || withdraw_number == ""){
        toast(1,"请输入充值积分个数");
    }
    else if (withdraw_number % 1 != 0){
        toast(1,"充值积分个数必须为整数");
    }
    else{
        toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/userUnderLinePayWnkBusinessRechargeIntegral",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"integral_number" : withdraw_number,
				"user_mobile"     : user_mobile
			},
			success: function(data) {

				if(data.status == 0) {
					toast(1,data.msg);
					
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(1,data.msg);
				}
			}
		});
    }
}

//充值个数输入监听
function inputChange(number) {
    document.getElementById("business_integral").innerHTML = number;
    document.getElementById("platform_integral").innerHTML = number;
}