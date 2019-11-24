var storage = window.localStorage;

mui.init();
mui.plusReady(function(){
	mui.ready(function(){
		getDetailData(0);
	})
})

//获取详情数据
function getDetailData(type) {
	toast(2, "打开loading");
	var className = "";
	var fuhao = "-";
	if (type == 0) {
		className = "income_money";
		fuhao = "+";
	} else {
		className = "income_money expenditure_amount";
		fuhao = "-";
	}
	$("#money_detail_ul li").remove();
	publicnull_tip("暂无数据",1);
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
			if (data.status == 0) {
				var list = data.data.detail;
				if (list.length <= 0) {
					toast(1, "暂无记录");
					publicnull_tip("暂无记录",1);
				} else {
					for (var index = 0; index < list.length; index++) {
						var obj = list[index];
						var html = "<li>" +
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
					publicnull_tip("关闭提示",0);
				}

			} else if (data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
				publicnull_tip(data.msg,1);
			}
		},
	});
}


/*
* 提示修改
* */
function publicnull_tip(content,state) {
    var publicnull_tip = document.getElementById("publicnull_tip");
    if (state == 0){
        publicnull_tip.style.display = "none";
    }
    else{
        document.getElementById("request_tip").innerText = content;
        publicnull_tip.style.display = "block";
    }
}