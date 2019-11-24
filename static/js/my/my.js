var storage = null;
mui.init({
	pullRefresh: {
		container: '#slider',
		down: {
			style: 'circle',
			callback: pullupRefresh,
		}
	}
});

// 初始化
mui.plusReady(function() {
	mui.ready(function() {
		storage = window.localStorage;
		// 获取账户余额
		getAccountBalance();

		plus.runtime.getProperty(plus.runtime.appid, function(inf) {
			document.getElementById("current_version").innerHTML = "V" + inf.version;
		});
		// 点击事件
		mui('.memmenu').on('tap', '.item', function() {
			var name = this.getAttribute('name');
			if(name + '' === 'exit_login') {
				exitLogin();
			} else {
				gotoNewPage(name);
			}
		})

		document.getElementById('legalize_status').addEventListener('tap', function(event) {
			event.stopPropagation();
			event.preventDefault();
			gotoNewPage(this.getAttribute('name'));
		})

		mui('.head').on('tap', '.msg', function() {
			var name = this.getAttribute('name');
			gotoNewPage(name);
		})
		mui('.wrap').on('tap', 'a', function() {
			var name = this.getAttribute('name');
			gotoNewPage(name);
		})
		document.getElementsByName('shop_information')[0].addEventListener('tap', function() {
			gotoNewPage(this.getAttribute('name'));
		})

		document.getElementById('operate').addEventListener('tap', function() {
			var type = -1; // 0 营业 1 暂停
			if($(this).hasClass("sel")) {
				type = 1;
			} else {
				type = 0
			}
			if(type == -1) {
				mui.toast("获取营业状态失败");
				return;
			}
			toast(2, "打开loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/updateBusinessOperateStatus",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					'type': type
				},
				success: function(data) {
					toast(3, data.msg);
					if(data.status == 0) {
						mui.toast(data.msg);
						if(String(data.msg) == '暂停营业') {
							$('#operate').removeClass("sel");
						} else {
							$('#operate').addClass("sel");
						}
					} else {
						mui.toast(data.msg);
					}
				}
			});

		});

		// 获取账户余额
		getAccountBalance();
		// 获取广告信息
		getAdUnread();
		// 获取认证状态
		selectBusinessLegalize();
		// 获取维护员信息
		selectMaintainInfo();
		// 获取营业状态
		selectBusinessOperateStatus();
		//获取服务内容和特色内容
		getServerAndFeatures();

		// 从别个页面返回时触发 
		window.addEventListener('keydownClose', function(event) {
			getAccountBalance();
			getAdUnread();
			selectBusinessLegalize();
			selectMaintainInfo();
			mMain.selectBusinessLegalize();
		});
	});
});

// 下拉刷新操作事件
function pullupRefresh() {
	setTimeout(function() {
		getAccountBalance();
		getAdUnread();
		selectBusinessLegalize();
		selectMaintainInfo();
		selectBusinessOperateStatus();
		//获取特色and服务标签
		getServerAndFeatures();
		mui('#slider').pullRefresh().endPulldown();
	}, 1000)
}

function selectBusinessOperateStatus() {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessOperateStatus",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
		},
		success: function(data) {
			toast(3, data.msg);
			if(data.status == 0) {
				if(parseInt(data.data.operate_status) === 0) {
					mui.toast("营业中");
					$('#operate').addClass(" sel");
				} else {
					mui.toast("暂停营业");
					$('#operate').removeClass(" sel");
				}
			} else {
				mui.toast(data.msg);
			}
		}
	});
}

// 获取账户余额
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
				// 商家展示图 用作头像
				if(data.data.cover_photo != undefined && data.data.cover_photo != '') {
					document.getElementById('header_img').src = data.data.img_path + data.data.cover_photo;
				}
				// 等级积分
				//				document.getElementById("level_integral").innerHTML = data.data.level_integral;
				// 我的账户
				document.getElementById("balance_tag").innerHTML = data.data.balance + "元";
				// 消费积分
				document.getElementById("consumption_integral").innerHTML = data.data.consumption_integral;
				// 玫瑰
				document.getElementById("my_rose").innerHTML = data.data.rose_number;
				// 商家等级名称
				document.getElementById("member_level_name").innerHTML = data.data.level_name;
				// 商家名称
				document.getElementById("nick_name_tag").innerHTML = data.data.store_name + "(" + data.data.type_name + ")";
			} else {
				0
				mui.toast(data.msg);
			}
		}
	});
}

// 退出登录
function exitLogin() {
	mui.confirm("确认退出登录?", "猛戳商家版", ['取消', '确定'], function(e) {
		if(e.index == 1) {
			exitLoginNetwork();
		}
	});

}

// 退出登录网络事件
function exitLoginNetwork() {
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/exitLogin",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			if(data.status == 0) {
				window.localStorage.clear();
				mui.confirm("退出登录成功!", "猛戳商家版", ["重启", "退出"], function(e) {
					if(e.index == 0) {
						plus.runtime.restart();
					} else {
						plus.runtime.quit();
					}
				});
			} else {
				alert(data.msg);
			}
		},
	});
}

// 跳转到那个页面
function gotoNewPage(name) {
	// 页面相对路径
	var url;
	// 页面ID
	var id;
	// 需要传递的参数
	var param = null;
	switch(name) {
		case 'about_us': // 关于我们
			url = "./about_us.html";
			id = "about_us.html";
			break;
		case 'shop_information': // 店铺信息
			url = "./shop_information.html";
			id = "shop_information.html";
			break;
		case 'account_balance': // 账户余额
			url = "./account_balance.html";
			id = "account_balance.html";
			break;
		case 'account_security': // 账户安全
			url = "./account_security.html";
			id = "account_security.html";
			break;
		case 'suggestion_feedback': // 投诉建议
			url = "./suggestion_feedback.html";
			id = "suggestion_feedback.html";
			break;
		case 'integral_system': // 我的积分
			url = "../integral/index.html";
			id = "integral_index.html";
			break;
		case 'problem': // 使用教程
			url = "./problem.html";
			id = "problem.html";
			break;
		case 'member_system': // 我的团队
			url = "./my_team.html";
			id = "my_team.html";
			break;
		case 'consumption_integral': // 消费积分
			//			url = "../consumption_integral/consumption_integral.html";
			url = './integral.html';
			id = "integral.html";
			break;
		case 'level_integral': // 等级积分
			//url = "../level_integral/level_integral.html";
			// 			url = '../level_integral/my_level.html';
			// 			id = "my_level.html";
			plus.webview.close(plus.webview.getWebviewById('protocol.html'));
			mui.openWindow({
				url: '../../protocol.html',
				id: 'protocol.html',
				styles: {
					top: '0px',
					bottom: '51px'
				},
				createNew: true,
				extras: {
					xieyi_type: '1' // 0 - 商家协议 1-商家升级协议
				}
			});
			return;
		case 'my_rose': // 我的玫瑰
			url = "../my_rose/my_rose.html";
			id = "my_rose.html";
			break;
		case 'extension_system': // 推广物料
			url = "./extension_system.html";
			id = "extension_system.html";
			break;
		case 'gift': // 推广物料
			url = "./extension_system.html";
			id = "extension_system.html";
			param = {
				type: String(1)
			};
			break;
		case 'send_integral': // 赠送积分
			url = "/web/level_integral/integral_send.html";
			id = "integral_send.html";
			param = {
				type: String(1)
			};
			break;
		case 'doings_spread': // 推广中心
			url = "./doings_spread.html";
			id = "doings_spread.html";
			break;
		case 'message_center': // 消息中心
			url = "./message_center.html";
			id = "message_center.html";
			break;
		case 'tag': // 商家标签
			url = "../my_tag/tag.html";
			id = "tag.html";
			break;
		case 'verinfo': // 版本信息
			mainUpdate.init(0); 
			return;
		case "legalize": // 商户认证
			url = "../business_legalize/legalize_tis.html";
			id = "legalize_tis.html";
			break;
		case "maintain": // 系统维护员
			maintain();
			break;
		default:
			mui.toast('开发中...');
			return;
	}
	mui.openWindow({
		url: url,
		id: id,
		styles: {
			top: '0px',
			bottom: '51px',
		},
		extras: param,
		createNew: true,
	});
}

var adNumber = 0;
// 获取未读广告
function getAdUnread() {
	toast(2,'打开LODING')
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/getAdUnread',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			toast(3,'关闭LODING')
			if(data.status == 0 && data.data != null && data.data.unread != 0) {
				$('#msg').addClass(' sel');
			} else {
				$('#msg').removeClass(' sel');
				getSystemMsg();
			}
		}
	});
}

// 获取未读系统消息条目数
function getSystemMsg() {
	toast(2,'打开Loging');
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/getSystemMsg',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			toast(3,'关闭Loging');
			if(data.status == 0  && data.data != null && data.data.unread != 0) {
				$('#msg').addClass(' sel');
			} else {
				if(adNumber = 0) {
					$('#msg').addClass(' sel');
				}
			}

		}
	});
}

// 获取商家认证状态
function selectBusinessLegalize() {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessLegalize",
		type: "POST",
		dataType: 'json',
		data: {
			'business_id': storage['business_id']
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(data.status == 0) {
				document.getElementById('legalize_status').innerHTML = data.data.status;
				//document.getElementById('legalize_status2').innerHTML = data.data.status;
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
			}
		}
	});
}

// 获取商家服务内容和特色内容
function getServerAndFeatures() {
	//服务内容
	$('.content_server p').remove();
	//特色内容
	$('.content_features p').remove();
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessTsAndFwContentByBusinessId",
		type: "POST",
		dataType: 'json',
		data: {
			'business_id': storage['business_id']
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(parseInt(data.status) === 0 && data.data != null){
				// 先服务内容
				if(data.data.fuwuLabel != null && data.data.fuwuLabel != undefined && data.data.fuwuLabel !== ''){
					var fuwu = data.data.fuwuLabel;
					var fuwuArr =  fuwu.split(",");
					for(var i = 0; i< fuwuArr.length ; i++){
						var html = '<p class="server_item">'+ fuwuArr[i] +'</p>';
						$('.content_server').append(html);
					}
				}
				// 特色内容
				if(data.data.teseLabel != null && data.data.teseLabel != undefined && data.data.teseLabel !== ''){
					var tese = data.data.teseLabel;
					var teseArr =  tese.split(",");
					for(var i = 0; i< teseArr.length ; i++){
						var html = '<p class="features_item">'+ teseArr[i] +'</p>';
						$('.content_features').append(html);
					}
				}
			}
// 			if(data.status == 0) {
// 				var server_list = '';
// 				var features_list = '';
// 				for(var i = 0; i < server_list; i++) {
// 					var obj = server_list.data;
// 					var html = "<p class=\"server_item\">" + obj.name + "</p>";
// 					$('.content_server').append(html);
// 				}
// 				for(var i = 0; i < features_list; i++) {
// 					var obj = server_list.data;
// 					var html = "<p class=\"features_item\">" + obj.name + "</p>";
// 					$('.content_features').append(html);
// 				}
// 			} else if(data.status == 2) {
// 				mMain.gotoLogin();
// 			} else {
// 				toast(1, data.msg);
// 			}
		}
	});
}

// 拨打维护管员电话
function maintain() {
	// 获取电话
	var tel = document.getElementById('maintain_tel').innerHTML;
	var telArr = tel.split(':');
	var btnArray = ['拨打', '取消'];
	mui.confirm('是否拨打' + telArr[1] + '?', '提示', btnArray, function(e) {       
		if(e.index == 0) {           
			plus.device.dial(telArr[1], false);       
		}   
	});
}

// 查询系统维护员信息
function selectMaintainInfo() {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectMaintainInfo",
		type: "POST",
		dataType: 'json',
		data: {
			'business_id': storage['business_id']
		},
		success: function(data) {
			if(data.status == 0) {
				document.getElementById('maintain_tel').innerHTML = data.data.maintain_name + ':' + data.data.maintain_phone;
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
			}
		}
	});
}