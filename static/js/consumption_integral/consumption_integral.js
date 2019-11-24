var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function(){
	
	mui.ready(function(){
		storage = window.localStorage;
		
		getAccountBalance();
		listOptionInit(0);
		
		// 提现按钮事件
		mui('.buts').on('tap', '#integral_exchange', function() {
			mui.openWindow({
				url: './consumption_integral_forward.html',
				id: 'consumption_integral_forward',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNew: true,
			});
		})
		
		// 用户充值按钮事件
		mui('.buts').on('tap', '#user_integral_recharge', function() {
			mui.openWindow({
				url: './user_integral_recharge.html',
				id: 'user_integral_recharge',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNew: true,
			});
		})
		
		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getAccountBalance();
			listOptionInit(0);
		});
	
	});
	
	
	//获取账户余额
	function getAccountBalance() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getBalance",
			type: "POST",
			dataType: 'json',
			data: {"business_id": storage["business_id"]},
			success: function(data) {
				if(data.status == 0) {
					toast(3, data.msg);
					document.getElementById("consumption_integral_tag").innerHTML = data.data.consumption_integral;
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(1,data.msg);
				}
			}
		});
	}
	
	
});

/*
 *	列表项初始化
 * type=0:积分收入，type=1：积分支出
 * */
function listOptionInit(type){
	if(type == 0){
		document.getElementById("integral_income").setAttribute("class","item sel"); 
		document.getElementById("integral_expenditure").setAttribute("class","item"); 
		getWnkBusinessConsumptionIntegralDetail(0);
	}
	else if(type == 1){
		document.getElementById("integral_income").setAttribute("class","item"); 
		document.getElementById("integral_expenditure").setAttribute("class","item sel");
		getWnkBusinessConsumptionIntegralDetail(1);
	}
}

//获取商家消费积分明细
function getWnkBusinessConsumptionIntegralDetail(type) {
	toast(2, "打开loading");
	$(".list li").remove();
	publicnull_tip("暂无数据",1);
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessConsumptionIntegralDetail",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"type"       : type
		},
		success: function(data) {

			if(data.status == 0) {
				toast(3, data.msg);
				publicnull_tip("关闭提示",0);
				var list = data.data;
				var type_str = "+";
				if(type == 0){
					type_str = "+";
				}
				else{
					type_str = "-";
				}
				for(var index = 0;index < list.length;index++){
					var obj = list[index];
					var html = "<li class=\"item\">"+
						        "<div class=\"left\">"+
						          "<span class=\"name\">"+obj.name+"</span>"+
						          "<span class=\"time\">"+obj.transactions_date+"</span>"+
						        "</div>"+
						        "<div class=\"right\">"+
						          "<span class=\"num down\">"+type_str+obj.integral_number+"</span>"+
						        "</div>"+
						      "</li>";
				$(".list").append(html);
				}
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1,data.msg);
				publicnull_tip(data.msg,1);
			}
		}
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