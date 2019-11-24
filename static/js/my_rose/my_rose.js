var storage = null;
mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		storage = window.localStorage;
		getAccountBalance();
		listOptionInit(0);

		// 帮助说明点击事件
		mui('.head').on('tap', '#help_icon', function() {
			toast(2, "开启loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + '/app/v1.0.0/getIntegralHelpContent',
				type: "POST",
				dataType: 'json',
				data: {
					"type": 5
				},
				success: function(data) {
					toast(3, "关闭loading");
					if(data.status == 0) {
						var open_type = data.data.open_type;
						if(open_type == 0){
							mui.openWindow({
								url: '../my/integral_help.html',
								id: 'integral_help.html',
								styles: {
									top: '0px',
									bottom: '51px',
								},
								extras: {
									'title': "玫瑰说明帮助",
									'type' : 5
								},
								createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
							});
						}
						else{
							showWithWaiting(data.data.content);
						}
					} else if(data.status == 2) {
						mMain.gotoLogin();
					} else {
						mui.openWindow({
								url: '../my/integral_help.html',
								id: 'integral_help.html',
								styles: {
									top: '0px',
									bottom: '51px',
								},
								extras: {
									'title': "玫瑰说明帮助",
									'type' : 5
								},
								createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
							});
					}
				},
			});
		});

		// 按钮事件
		mui('.buts').on('tap', 'a', function() {
			var name = this.getAttribute('name');
			var url, id;
			switch(name) {
				case 'rose_exchange': // 玫瑰兑换
					url = "./rose_exchange.html";
					id = "rose_exchange.html";
					break;
				default:
					kaifazhong();
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
		});
		initViewWebViewData();
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
					document.getElementById("rose_number_tag").innerHTML = data.data.rose_number;
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			}
		});
	}
});

/*
 *	列表项初始化
 * type=0:玫瑰收入，type=1：玫瑰支出
 * */
function listOptionInit(type) {
	if(type == 0) {
		document.getElementById("rose_income").setAttribute("class", "item sel");
		document.getElementById("rose_expenditure").setAttribute("class", "item");
		getWnkBusinessRoseDetail(0);
	} else if(type == 1) {
		document.getElementById("rose_income").setAttribute("class", "item");
		document.getElementById("rose_expenditure").setAttribute("class", "item sel");
		getWnkBusinessRoseDetail(1);
	}
}

//获取商家玫瑰明细
function getWnkBusinessRoseDetail(type) {
	toast(2, "打开loading");
	$(".list li").remove();
	publicnull_tip("暂无数据", 1);
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessRoseDetail",
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
					type_str = "-";
				}
				for(var index = 0; index < list.length; index++) {
					var obj = list[index];
					var html = "<li class=\"item\">" +
						"<div class=\"left\">" +
						"<span class=\"name\">" + obj.name + "</span>" +
						"<span class=\"time\">" + obj.transactions_date + "</span>" +
						"</div>" +
						"<div class=\"right\">" +
						"<span class=\"num down\">" + type_str + obj.integral_number + "</span>" +
						"</div>" +
						"</li>";
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