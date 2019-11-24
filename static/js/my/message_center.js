var storage = null;
mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		storage = window.localStorage;

		getAdUnread();
		getSystemMsg();
		
		listOptionInit(0);
		// 标记所有推广活动未读消息为已读
		// updateReadByBusinessId();
	});

});

/*
 *	列表项初始化
 * type=0:推广活动，type=1：系统消息
 * */
function listOptionInit(type) {
	if(type == 0) {
		document.getElementById("recommend_huodong").setAttribute("class", "item sel");
		document.getElementById("system_message").setAttribute("class", "item");
		getMessage();
		updateAdMsgUnread();
	} else if(type == 1) {
		document.getElementById("recommend_huodong").setAttribute("class", "item");
		document.getElementById("system_message").setAttribute("class", "item sel");
		getSystemMessage();
		updateSystemMsgUnread();
	}
}


// 更新所有未读推广消息为已读
function updateAdMsgUnread(){
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/updateAdMsgUnread',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			console.log(JSON.stringify(data)); 
			$.hideLoading(); 
			if(data.status == 0 && data.data.unread != 0) {
				getAdUnread();
			}

		},
		error: function() {
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			$.toast("数据加载失败", "text");
		}
	});
}

// 更新所有未读系统消息为已读
function updateSystemMsgUnread(){
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/updateSystemMsgUnread',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			$.hideLoading();  
			if(data.status == 0) {
				getSystemMsg();
			}
		},
		error: function() {
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			$.toast("数据加载失败", "text");
		}
	});
	
}
  
// 获取推广活动消息
function getMessage() {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	var my_message_ul = $('#my_message_ul');
	my_message_ul.empty();
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/selectSystemMsgDoingsSpreadById',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			$.hideLoading();
			if(data.status == 0) {
				if(data.data.length > 0) {
					toast(3, "关闭Loading");
					publicnull_tip("关闭提示", 0);
					data.data.forEach(function(e) {
						var html = '<li>' +
							'	<a class="system_message_title">' + e.title + '</a>' +
							'	<a class="system_message_content">' + e.system_msg + '</a>' +
							'	<a class="system_message_time">' + e.create_time + '</a>' +
							'</li>';
						my_message_ul.append(html);
					})
				} else {
					toast(1, "暂无数据");
					publicnull_tip("暂无数据", 1);
				}
				mui.fire(plus.webview.getLaunchWebview(), 'updateRead');
			} else if(data.status == 2) {
				mMain.gotoLogin();
				toast(1, data.msg);
			} else {
				toast(1, data.msg);
				publicnull_tip(data.msg, 1);
			}
		},
		error: function() {
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			$.toast("数据加载失败", "text");
		}
	});
}

//获取系统消息
function getSystemMessage() {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	var my_message_ul = $('#my_message_ul');
	my_message_ul.empty();
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/selectWnkBusinessSystemMessageByBusinessId',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			$.hideLoading();
			if(data.status == 0) {
				if(data.data.length > 0) {
					toast(3, "关闭Loading");
					publicnull_tip("关闭提示", 0);
					data.data.forEach(function(e) {
						var html = '<li>' +
							'	<a class="system_message_title">' + e.title + '</a>' +
							'	<a class="system_message_content">' + e.content + '</a>' +
							'	<a class="system_message_time">' + e.send_date + '</a>' +
							'</li>';
						my_message_ul.append(html);
					})
				} else {
					toast(1, "暂无数据");
					publicnull_tip("暂无数据", 1);
				}
				mui.fire(plus.webview.getLaunchWebview(), 'updateRead');
			} else if(data.status == 2) {
				mMain.gotoLogin();
				toast(1, data.msg);
			} else {
				toast(1, data.msg);
				publicnull_tip(data.msg, 1);
			}
		},
		error: function(a, b, c) {
			console.log(JSON.stringify(a));
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			$.toast("数据加载失败", "text");
		}
	});
}


function updateReadByBusinessId() {
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business_app/v1.0.0/updateReadByBusinessId',
			type: "post",
			dataType: 'json',
			timeout: 5000,
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				$.hideLoading();
				mui.fire(plus.webview.getLaunchWebview(), 'updateRead');
			},
			error: function() {
				// 关闭加载中的Loading层
				$.hideLoading();
				// 打开数据加载失败的toast
				$.toast("数据加载失败", "text");
			}
		});
	}

/**
 * 获取未读广告
 */
function getAdUnread() {
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
			$.hideLoading();
			if(data.status == 0 && data.data.unread != 0) {
				$('#recommend_huodong_span').css('display','inline');
			} else {
				$('#recommend_huodong_span').css('display','none');
			}

		},
		error: function() {
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			$.toast("数据加载失败", "text");
		}
	});
}

// 获取未读系统消息条目数
function getSystemMsg() {
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
			if(data.status == 0 && data.data.unread != 0) {
				$('#system_message_span').css('display','inline');
			} else {
				$('#system_message_span').css('display','none');
			}

		},
		error: function() {
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			$.toast("数据加载失败", "text");
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