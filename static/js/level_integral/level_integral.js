var storage = null;

mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {


	mui.ready(function() {
		storage = window.localStorage;
		// 获取账户余额
		getAccountBalance();
		// 列表项初始化 （type=0:积分收入，type=1：积分赠送）
		listOptionInit(0);
		// 其他选项按钮事件
		mui('.buts').on('tap', 'a', function() {
			var name = this.getAttribute('name');
			var url, id;
			switch(name) {
				case 'level_upgrade': // 升级
					url = "./level_upgrade.html";
					id = "level_upgrade.html";
					break;
				case 'integral_send': // 赠送
					url = "./integral_send.html";
					id = "integral_send.html";
					break;
				default:
					return;
			}
			mui.openWindow({
				url: url,
				id: id,
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
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				if(data.status == 0) {
					toast(3, data.msg);
					document.getElementById("level_integral").innerHTML = data.data.level_integral;
					document.getElementById("level_name").innerHTML = data.data.level_name;

				} else {
					mui.toast(data.msg);
				}
			}
		});
	}

});

/*
 *	列表项初始化
 * type=0:积分收入，type=1：积分赠送
 * */
function listOptionInit(type) {
	if(type == 0) {
		document.getElementById("integral_income").setAttribute("class", "item sel");
		document.getElementById("integral_send").setAttribute("class", "item");
		getWnkBusinessLevelIntegralDetail(0);
	} else if(type == 1) {
		document.getElementById("integral_income").setAttribute("class", "item");
		document.getElementById("integral_send").setAttribute("class", "item sel");
		getWnkBusinessLevelIntegralDetail(1);
	}
}

//获取商家等级积分明细
function getWnkBusinessLevelIntegralDetail(type) {
	toast(2, "打开loading");
	$(".list li").remove();
	publicnull_tip("暂无数据", 1);
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessLevelIntegralDetail",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"type": type
		},
		success: function(data) {

			if(data.status == 0) {
				toast(3, data.msg);
				publicnull_tip("关闭提示", 0);
				var list = data.data;
				var type_str = "+";
				if(type == 0) {
					type_str = "+";
				} else {
					type_str = "";
				}
				for(var index = 0; index < list.length; index++) {
					var obj = list[index];
					var html = "";
					if(type == 0){
						html = "<li class=\"item\">" +
								"<div class=\"left\">" +
								"<span class=\"name\">" + obj.name + "</span>" +
								"<span class=\"time\">" + obj.transactions_date + "</span>" +
								"</div>" +
								"<div class=\"right\">" +
								"<span class=\"num down\">" + type_str + obj.integral_number + "</span>" +
								"</div>" +
								"</li>";
					}
					else{
						html = "<li class=\"item\">" +
								"<div class=\"left\">" +
								"<span class=\"name\">" + obj.name + "</span>" +
								"<span class=\"time\">" + obj.transactions_date + "</span>" +
								"</div>" +
								"<div class=\"right\">" +
								"<span class=\"num down\">" + type_str + obj.integral_number + "</span>" +
								"<span class=\"time\">" + obj.user_mobile + "</span>" +
								"</div>" +
								"</li>";
					}
					$(".list").append(html);
				}
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
				publicnull_tip(data.msg, 1);
			}
		}
	});
}

/*
 * 提示修改
 * */
function publicnull_tip(content, state) {
	var publicnull_tip = document.getElementById("publicnull_tip");
	if(state == 0) {
		publicnull_tip.style.display = "none";
	} else {
		document.getElementById("request_tip").innerText = content;
		publicnull_tip.style.display = "block";
	}
}