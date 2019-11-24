var storage = null;
var integralType = 0; // 0-推广积分 1-等级积分
mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		// 初始化变量
		storage = window.localStorage;
		var self = plus.webview.currentWebview();
		var type = self.type;
		
		// 绑定事件
		addEvent();
		// 模拟点击
		if(type != undefined){
			var menu = $('#level_integral_menu');
				menu.addClass('mui-active');
				$('#spread_integral_menu').removeClass('mui-active');

				$('#spread_integral').css('display', 'none');
				$('#level_integral').css('display', 'inline');
				$('#wrap_item_1').text('收入明细');
				$('#wrap_item_2').text('赠送支出');
				$('#wrap_item_3').css('display', 'inline');
				integralType = 1;
				setTimeout(function(){ 
			    		// 获取等级积分余额
					getAccountBalanceByLevel();
					listOptionInit(0);
			    }, 100);
		}
		else{
			mui.trigger(document.getElementById('spread_integral_menu'), 'tap');
		}
		initViewWebViewData();
	});
})

function addEvent() { // mui-active
	// 中间的列表点击切换事件
	mui('.wrap').on('tap', 'a', function() {
		switch (this.getAttribute('id')) {
			case 'wrap_item_1':
				listOptionInit(0);
				break;
			case 'wrap_item_2':
				listOptionInit(1);
				break;
			case 'wrap_item_3':
				listOptionInit(2);
				break;
		}
	});
	
	// 帮助说明点击事件
	mui('.head').on('tap', '#help_icon', function() {
		var helpType = 0;
		var helpTitle = "";
		if(integralType == 0){
			helpTitle = "推广积分说明帮助";
			helpType = 4;
		}
		else if(integralType == 1){
			helpTitle = "等级积分说明帮助";
			helpType = 3;
		}
		toast(2, "开启loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/app/v1.0.0/getIntegralHelpContent',
			type: "POST",
			dataType: 'json',
			data: {
				"type": helpType
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					var open_type = data.data.open_type;
					if(open_type == 0){
						mui.openWindow({
							url: './integral_help.html',
							id: 'integral_help.html',
							styles: {
								top: '0px',
								bottom: '51px',
							},
							extras: {
								'title': helpTitle,
								'type' : helpType
							},
							createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
						});
					}
					else{
//						initView();
						showWithWaiting(data.data.content);
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.openWindow({
							url: './integral_help.html',
							id: 'integral_help.html',
							styles: {
								top: '0px',
								bottom: '51px',
							},
							extras: {
								'title': helpTitle,
								'type' : helpType
							},
							createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
						});
				}
			},
		});
	});



	mui('.mui-segmented-control').on('tap', 'a', function() {
		switch (this.getAttribute('id')) {
			case 'level_integral_menu':
				var menu = $('#level_integral_menu');
				menu.addClass('mui-active');
				$('#spread_integral_menu').removeClass('mui-active');

				$('#spread_integral').css('display', 'none');
				$('#level_integral').css('display', 'inline');
				$('#wrap_item_1').text('收入明细');
				$('#wrap_item_2').text('赠送支出');
				$('#wrap_item_3').css('display', 'inline');
				integralType = 1;
				setTimeout(function(){ 
			    		// 获取等级积分余额
					getAccountBalanceByLevel();
					listOptionInit(0);
			    }, 100);
				break;
			case 'spread_integral_menu':
				var menu = $('#spread_integral_menu');
				menu.addClass('mui-active')
				$('#level_integral_menu').removeClass('mui-active');

				$('#spread_integral').css('display', 'inline');
				$('#level_integral').css('display', 'none');
				$('#wrap_item_1').text('收入明细');
				$('#wrap_item_2').text('支出明细');
				$('#wrap_item_3').css('display', 'none');
				integralType = 0;
				
				setTimeout(function(){ 
			    		// 获取推广积分余额
					getAccountBalance();
					listOptionInit(0);
			    }, 100);
				
				break;
		}
	});

	// 推广积分提现按钮点击事件
	document.getElementById('spread_integral_input').addEventListener('tap', function() {
		mui.openWindow({
			url: '../consumption_integral/consumption_integral_forward.html',
			id: 'consumption_integral_forward',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			createNew: true,
		});
	});
	
	// 等级积分赠送按钮点击事件
	document.getElementById('level_integral_input').addEventListener('tap',function(){
		mui.openWindow({
			url: '../level_integral/integral_send.html',
			id: 'integral_send.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			createNew: true,
		});
	});

}

/*
 *	列表项初始化
 * type=0:积分收入，type=1：积分支出
 * */
function listOptionInit(type) {
	if (type == 0) {
		document.getElementById("wrap_item_1").setAttribute("class", "item sel");
		document.getElementById("wrap_item_2").setAttribute("class", "item");
		document.getElementById("wrap_item_3").setAttribute("class", "item");
		// 0-推广积分 1-等级积分
		if (integralType == 0) {
			getWnkBusinessConsumptionIntegralDetail(0);
		} else {
			getWnkBusinessLevelIntegralDetailByLevel(0);
		}
		return;
	}
	if (type == 1) {
		document.getElementById("wrap_item_1").setAttribute("class", "item");
		document.getElementById("wrap_item_2").setAttribute("class", "item sel");
		document.getElementById("wrap_item_3").setAttribute("class", "item");
		if (integralType == 0) {
			getWnkBusinessConsumptionIntegralDetail(1);
		} else {
			getWnkBusinessLevelIntegralDetailByLevel(1);
		}
		return;
	}
	if (type == 2) {
		document.getElementById("wrap_item_1").setAttribute("class", "item");
		document.getElementById("wrap_item_2").setAttribute("class", "item");
		document.getElementById("wrap_item_3").setAttribute("class", "item sel");
		if (integralType == 1) {
			getWnkBusinessLevelIntegralDetailByLevel(2);
		}
		return;
	}
}

//获取账户余额  -- 推广积分
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
			toast(3, data.msg);
			if (data.status == 0) {
				document.getElementById('spread_integral_span').innerText = data.data.consumption_integral;
			} else if (data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
			}
		}
	});
}


//获取推广积分明细 - 0-收入 1-支出
function getWnkBusinessConsumptionIntegralDetail(type) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	var content = $('#content');
	content.empty();
	publicnull_tip("暂无数据",1);
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessConsumptionIntegralDetail",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"type": type
		},
		success: function(data) {
			toast(3, data.msg);
			
			if (data.status == 0) {
				var type_str = 0;
				if (type == 0) {
					type_str = "+";
				} else {
					type_str = "-";
				}
				var index = data.data;
				if (index.length > 0) {
					for (var i = 0; i < index.length; i++) {
						var obj = index[i];
						var html = '' +
							'<li class="item">' +
							'	<div class="left">' +
							'		<span class="name">' + obj.name + '</span>' +
							'		<span class="time">' + obj.transactions_date + '</span>' +
							'	</div>' +
							'	<div class="right">' +
							'		<span class="num down">' + type_str + obj.integral_number + '</span>' +
							'	</div>' +
							'</li>';
						content.append(html);
					}
					publicnull_tip("关闭提示",0);
				}
			} else if (data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
				publicnull_tip(data.msg,1);
			}
		}
	});
}

//获取账户余额 - 等级积分
function getAccountBalanceByLevel() {
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
			console.log(JSON.stringify(data));
			if (data.status == 0) {
				toast(3, data.msg);
				document.getElementById('level_integral_span').innerText = data.data.level_integral;
				document.getElementById('level_integral_count_income').innerText  = "总收入:"+data.data.level_integral_count_income;
				document.getElementById('send_integral_count_integral').innerText = "赠送积分:-"+data.data.level_integral_count_send;
				document.getElementById('integral_xf_count_integral').innerText   = "客户消费总支出:-"+data.data.level_integral_count_xfzc;
			} else {
				mui.toast(data.msg);  
			}
		}
	});
}

//获取商家等级积分明细 - 等级积分
function getWnkBusinessLevelIntegralDetailByLevel(type) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	var content = $('#content');
	content.empty();
	publicnull_tip("暂无数据",1);
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessLevelIntegralDetail",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"type": type
		},
		success: function(data) {
			toast(3, data.msg);
			if (data.status == 0) {
				var type_str = 0;
				if (type == 0) {
					type_str = "+";
				} else {
					type_str = "-";
				}
				var index = data.data;
				if (index.length > 0) {
					for (var i = 0; i < index.length; i++) {
						var obj = index[i];
						var name = obj.name;
						if(type == 1){
							name = "向用户"+obj.user_mobile+"赠送";
						}
						else if(type == 2){
							name = obj.user_mobile+"消费";
						}
						var html = '' +
							'<li class="item">' +
							'	<div class="left">' +
							'		<span class="name">' + name + '</span>' ;
						if(type == 1){
							var integral_type = obj.integral_type;
							if(integral_type == 0){
								html = html + '		<span class="time">赠送类型：兑换积分</span>';
							}
							else if(integral_type == undefined){
								html = html + '		<span class="time">赠送类型：赠送积分</span>';
							}
							else{
								html = html + '		<span class="time">赠送类型：赠送积分</span>';
							}
						}
						else if(type == 2){
							var pay_type = obj.pay_type;
							if(pay_type == 2){
								html = html + '		<span class="time">支付方式：通用积分支付</span>';
							}
							else if(pay_type == 3){
								html = html + '		<span class="time">支付方式：消费积分支付</span>';
							}
							else if(pay_type == 4){
								html = html + '		<span class="time">支付方式：微信支付</span>';
							}
							else if(integral_type == undefined){
								html = html + '		<span class="time">支付方式：通用积分支付</span>';
							}
						}
							html = html + '		<span class="time">' + obj.transactions_date + '</span>' +
							'	</div>' +
							'	<div class="right">' +
							'		<span class="num down">' + type_str + obj.integral_number + '</span>' +
							'	</div>' +
							'</li>';
						content.append(html);
					}
					publicnull_tip("关闭提示",0);
				}
			} else if (data.status == 2) {
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