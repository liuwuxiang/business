mui.init();

var storage = window.localStorage;

var joinStatus = -1;

mui.plusReady(function() {
	// 扫描对象
	var scan = null;
	// 本地存储对象
	var storage = window.localStorage;
	//进出门状态、是否到期
	var in_or_out = -1;
	var is_dueto = -1;

	mui.ready(function() {
		//关闭扫码界面
		plus.webview.close("scan.html", "none");
		//取参数，判断出入状态、是否到期
		var self = plus.webview.currentWebview();
		user_id = self.user_id;
		// 获取状态
		gymCardInOutRecordPop(user_id);
	});
});

function gymCardInOutRecordPop(user_id) {
	selectUserGymCardStatusByUserId(user_id);
	mui('.pop_gym_card_border')
		.on('tap', '#pop_close', function() {
			closePop();
		})
		.on('tap', '#pop_confirm', function() {
			closePop();
		});
		
}

//1、会员进入
function memberEnter() {
	$('#pop_title').text('人员进入');
	$('.pop_status').css('visibility', 'hidden');
	$('.pop_leave_time').css('display', 'none');
	//确认按钮图标和背景
	$('#pop_confirm').css('background-color', '#99CC00');
	$('#pop_icon_confirm').attr('src', '../../static/images/wnk_business/memberEnter.png');
	$('#pop_txt_confirm').text('确认');
}

//2、会员进入但健身卡到期
function memberCardDueto() {
	$('#pop_title').text('人员进入');
	$('.pop_status').css('visibility', 'hidden');
	$('.pop_leave_time').css('display', 'none');
	//确认按钮图标和背景
	$('#pop_confirm').css('background-color', '#FF0000');
	$('#pop_icon_confirm').attr('src', '../../static/images/wnk_business/memberCardDueTo.png');
	$('#pop_txt_confirm').text('已到期');
}

//3、会员离开
function memberLeave() {
	$('#pop_title').text('人员离开');
	$('.pop_status').css('visibility', 'visible');
	$('.pop_leave_time').css('display', '');
	//确认按钮图标和背景
	$('#pop_confirm').css('background-color', '#99CC00');
	$('#pop_icon_confirm').attr('src', '../../static/images/wnk_business/memberLeave.png');
	$('#pop_txt_confirm').text('确认');
}

//关闭弹窗
function closePop() {
	mui('#gym_card_pop').popover('hide');
	//TODO 跳转到哪个页面？并且关闭该空白页面
	console.log(joinStatus);
	//joinStatus 0 进入 1- 退出
	if(parseInt(joinStatus) !== 2){
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/insertUserGymCardStatusByUserId",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				'user_id': user_id,
				'type'   : joinStatus
			},
			success: function(data) {
				toast(3, data.msg);
				console.log(JSON.stringify(data));  
				if (data.status == 0) {
					mui.toast(data.msg);
					plus.webview.close("scan.html", "none");
					plus.webview.close("gym_card_in_out_record.html", "none");
				} else {
					
				}
			}
		});
	} else {
		mui.toast("会员卡已到期");
		plus.webview.close("scan.html", "none");
		plus.webview.close("gym_card_in_out_record.html", "none");
	}
	
}


function selectUserGymCardStatusByUserId(user_id) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectUserGymCardStatusByUserId",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			'user_id': user_id
		},
		success: function(data) {
			toast(3, data.msg);
			if (data.status == 0) {
				// 进入健身房
				if(data.data == null){
					memberEnter();
					joinStatus = 0;
				}
				if(data.data == 0){
					memberEnter();
					joinStatus = 0;
				}
				if(data.data == 1){
					memberLeave();
					joinStatus = 1;
				}
				if(data.data == 2){
					memberCardDueto();
				}
				selectUserInfo();
				//调用隐藏/显示弹出框
				// mui('#gym_card_pop').popover('toggle', document.getElementById('pop_container'));
			} else {
				mui.confirm(data.msg, '猛戳商家版本', ['是'], function(e) {
					// 关闭扫描页面
					plus.webview.close("scan.html", "none");
					plus.webview.close("gym_card_in_out_record.html", "none");
				}, 'div')
			}
		}
	});
}

// 查询用户信息
function selectUserInfo(){
	console.log(user_id);
	console.log(storage["business_id"]);
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectUserGymCardInfoByUserId",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			'user_id': user_id
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			toast(3, data.msg);
			if (data.status == 0) {
				document.getElementById('pop_member_head').setAttribute('src',data.data.img_path+data.data.header);
				 document.getElementById('pop_member_name').innerText = data.data.nick_name;
				 document.getElementById('pop_member_dueto').innerText = data.data.card_end_time;
				 document.getElementById('pop_enter_time').innerText = data.data.join_time;
				 //调用隐藏/显示弹出框
				 mui('#gym_card_pop').popover('toggle', document.getElementById('pop_container'));
			} else {
				mui.confirm(data.msg, '猛戳商家版本', ['是'], function(e) {
					// 关闭扫描页面
					plus.webview.close("scan.html", "none");
					plus.webview.close("gym_card_in_out_record.html", "none");
				}, 'div')
			}
		}
	});
}
