mui.init();
mui.plusReady(function() {

	// 扫描对象
	var scan = null;

	// 本地存储对象
	var storage = window.localStorage;

	mui.ready(function() {

		// 设置扫描区域高度
		// 获取手机屏幕高度
		var phoneHeight = plus.screen.resolutionHeight;
		var phoneWidth = plus.screen.resolutionWidth;
		// 获取当前1rem等于多少px 然后计算顶部高度
		var headHeight = parseInt(document.documentElement.clientHeight / 7.5 * 0.88);
		// 给扫描框设置高度 屏幕高度-底部高度-顶部高度
		// 		document.getElementById('barcode').style.height = (phoneHeight - 47 - headHeight) + 'px';
		// 		document.getElementById('barcode').style.width = phoneWidth + 'px';
		$('#barcode').width(phoneWidth);
		$('#barcode').height(phoneHeight - 47 - headHeight);
		// 开始扫描
		scanQrCode();
	});

	//扫描二维码
	function scanQrCode() {
		// 开始扫描
		if (scan == null) {
			scan = new plus.barcode.Barcode('barcode', [plus.barcode.QR], {
				background: '#000'
			});
			scan.onmarked = onmarked;
		}
		scan.start();
	}

	//停止扫描
	function endScan() {
		scan.cancel();
		// scan.close();
	}

	// 二维码扫描成功
	function onmarked(type, result, file) {
		endScan();
		var result = result;
		console.log(JSON.stringify(result));
		var result2 = JSON.parse(result);



		if (result2.type == 1) {
			// 会员权益订单
			memberQYQrCodeMake(result2.user_id, result2.order_no);
		} else if (result2.type == 2) {
			// 商家普通订单
			orderQrcodeMake(result2.user_id, result2.order_no);
		} else if (result2.type == 3) {
			// 积分商城订单
			IntegralOrderConfirm(result2.user_id, result2.order_no);
		} else if (result2.type == 4) {
			//健身卡扫码记录用户进出门
			//测试健身卡弹出框
			gymCardInOutRecord(result2.user_id);
		} else {
			plus.nativeUI.toast("未识别出有用信息");
			plus.webview.close("scan.html")
		}

	}

	// 商家商城积分订单使用
	function IntegralOrderConfirm(user_id, order_no) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business/getIntegralOrderByOrderId",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"order_no": order_no,
				"user_id": user_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				if (data.status == 0) {
					mui.openWindow({
						url: '../integral/order_confirm.html',
						id: 'order_confirm.html',
						styles: {
							top: '0px',
							bottom: '51px',
						},
						extras: {
							'order_id': order_no,
							'user_id': user_id
						},
						createNew: true
					});
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//会员权益免费使用网络事件
	function memberQYQrCodeMake(user_id, order_no) {
		mui.openWindow({
			url: './order_detail.html',
			id: 'order_detail.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			extras: {
				'order_no': order_no,
				'type': '1'
			},
			createNew: true
		});
	}

	//订单使用
	function orderQrcodeMake(user_id, order_no) {
		//		mui.openWindow({
		//			url: './order_detail.html',
		//			id: 'order_detail.html',
		//			styles: {top: '0px',bottom: '51px',},
		//			extras: {'order_no': order_no,'type': '0'},
		//			createNew: true
		//		});
		mui.openWindow({
			url: './order_make.html',
			id: 'order_make.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			extras: {
				'order_no': order_no
			},
			createNew: true
		});
	}

});

//健身卡扫描出入记录弹窗
/*
 * @param 
 * 	in_out:进出门状态；0:进入、1：离开
 * 	is_dueto:健身卡是否到期；0:未到期、1:到期
 */
function gymCardInOutRecord(user_id) {
	//	mui("#gym_card_pop").popover('toggle', document.getElementById('pop_container'));
	mui.openWindow({
		url: './gym_card_in_out_record.html',
		id: 'gym_card_in_out_record.html',
		styles: {
			top: '0px',
			bottom: '51px',
		},
		extras: {
			//进出门状态、是否到期
			user_id: user_id,
		},
		createNew: true
	});
}
