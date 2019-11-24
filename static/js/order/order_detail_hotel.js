// 订单IDB
var order_id = -1;

// 本地存储
var storage = window.localStorage;

mui.init();

mui.plusReady(function() {
	mui.ready(initDate);
});

// 初始化数据
function initDate() {
	// 获得必要参数
	var self = plus.webview.currentWebview();
	order_id = getOrderId(self.order_no);
	// 接受订单
	document.getElementById('submit_accepted').addEventListener('click', acceted, false);
	// 拒绝订单
	document.getElementById('submit_cancel').addEventListener('click', cancel, false);
	// 关闭当前页面
	document.getElementById('back').addEventListener('click',function(){
		plus.webview.close('order_detail_hotel.html');
	},false);
	mui('.order-info-hotel').on('tap','.orderId_copy',function(){
		var copy_content = this.parentNode.innerText.split('复制')[0];
		// 判断是安卓还是ios
		if(mui.os.ios){
		//ios
		var UIPasteboard = plus.ios.importClass("UIPasteboard");
		    var generalPasteboard = UIPasteboard.generalPasteboard();
		    //设置/获取文本内容:
		    generalPasteboard.plusCallMethod({
		        setValue:copy_content,
		        forPasteboardType: "public.utf8-plain-text"
		    });
		    generalPasteboard.plusCallMethod({
		        valueForPasteboardType: "public.utf8-plain-text"
		    });
		}else{
		//安卓
		var context = plus.android.importClass("android.content.Context");
		  var main = plus.android.runtimeMainActivity();
		  var clip = main.getSystemService(context.CLIPBOARD_SERVICE);
		  plus.android.invoke(clip,"setText",copy_content);
		}
		// 提示用户
		plus.nativeUI.toast('复制成功');
	})
}

// 通过订单号获取订单ID
function getOrderId(order_no) {
	// 如果没查到就返回 -1
	toast(2, "打开loading");
	jQuery.support.cors = true;
	jQuery.ajax({
		url: mMain.url + "/wnk_business_app/v2.0.0/getWnkOrderIdByOrderId",
		type: "POST",
		dataType: 'json',
		data: {
			'order_no': order_no
		},
		success: function(data) {
			toast(3, "关闭loading");
			if (data.status == 0) {
				order_id = data.data.order_id;
				user_id = data.data.user_id;
				// 获取订单详情
				getOrderDetail(order_id);
			}
		},
	});
}

//获取订单详情
function getOrderDetail(o_id) {
	plus.nativeUI.showWaiting("载入中")
	jQuery.support.cors = true;
	jQuery.ajax({
		url: mMain.url + "/wnk_business_app/v2.0.0/wnkBuyOrderDetailByHotel",
		type: "POST",
		dataType: 'json',
		data: {
			"businessId": storage['business_id'],
			"orderId": o_id
		},
		success: function(data) {
			plus.nativeUI.closeWaiting();
			if (data.status == 0 && data.data != null) {
				// 基本信息
				var basic = data.data[0].basic;
				// 扩展信息
				var expand = data.data[0].expand;
				// 退款信息
				var refund = data.data[0].refund;
				// 规格信息
				var specification = data.data[0].specification[0];
				// 规格扩展信息
				var specification_expand = data.data[0].specification_expand;
				// 商品信息
				var commodity = data.data[0].commodity;
				// 商家信息
				var business = data.data[0].business;
				// 先判断订单状态

				/*
				3-等待商家确认,
				4-商家已确认,
				5-商家已拒绝,
				6-用户取消订单
				*/
				if (basic.state == 0) {
					document.getElementById('order_state_div_1').style.display = 'none';
					document.getElementById('order_state_div_2_title').innerHTML = '订单已完成';
					document.getElementById('order_state_div_2_tip').innerHTML = ' ';
					document.getElementById('order_state_div_2').style.display = 'inline';
				}

				if (basic.state == 3) {
					document.getElementById('order_state_div_1').style.display = 'inline';
					// 下单时间
					var xdDate = new Date(basic.submit_time);
					// 当前时间
					var newDates = new Date();
					// 计算还剩几分钟
					var cha = 60 - (Date.parse(newDates) - Date.parse(xdDate)) / 1000 / 60;
					document.getElementById('info-business-confirm-tip').innerHTML = cha.toFixed(0);
					document.getElementById('order_state_div_2').style.display = 'none';
				}

				if (basic.state == 4) {
					document.getElementById('order_state_div_1').style.display = 'none';
					document.getElementById('order_state_div_2_title').innerHTML = '房间已经确认';
					document.getElementById('order_state_div_2_tip').innerHTML = '房间如有变动,请联系用户处理';
					document.getElementById('order_state_div_2').style.display = 'inline';
				}

				if (basic.state == 5) {
					document.getElementById('order_state_div_1').style.display = 'none';
					document.getElementById('order_state_div_2_title').innerHTML = '订单已取消';
					document.getElementById('order_state_div_2_tip').innerHTML = '商户主动取消';
					document.getElementById('order_state_div_2').style.display = 'inline';
				}

				if (basic.state == 6) {
					document.getElementById('order_state_div_1').style.display = 'none';
					document.getElementById('order_state_div_2_title').innerHTML = '订单已取消';
					document.getElementById('order_state_div_2_tip').innerHTML = '用户主动取消';
					document.getElementById('order_state_div_2').style.display = 'inline';
				}
				// 商品信息
				document.getElementById('goods_name').innerHTML = business.name;

				// 拼接入住时间
				var joinTime = new Date(expand.register_start_time_stamp);
				var outTime = new Date(expand.register_end_time_stamp);
				// 入住天数
				var checkIn = (Date.parse(outTime) - Date.parse(joinTime)) / (1000 * 60 * 60 * 24);
				// 入住人数
				var checkInNum = expand.register_people.split(',').length;
				// 周
				var weeks = new Array("日", "一", "二", "三", "四", "五", "六");
				var registerStr = (joinTime.getMonth() + 1) + '月' + joinTime.getDate() + '日(周' + weeks[joinTime.getDay()] + ')-' +
					(outTime.getMonth() + 1) + '月' + outTime.getDate() + '日(周' + weeks[outTime.getDay()] + ')';
				registerStr += '共' + checkInNum + '晚' + checkIn + '间';
				document.getElementById('register_str').innerHTML = registerStr;
				// 入住人
				document.getElementById('register_name').innerHTML = expand.register_people;
				// 联系电话
				document.getElementById('register_mobile').innerHTML = expand.mobile +
					'<img src="../../static/images/wnk_business/tel.png">';
				// 预计到店时间
				document.getElementById('register_time').innerHTML = expand.register_time;
				// 房费
				var ul = $('#order_info_ul');
				// 是否有早餐
				var breakfast = '';
				if (specification_expand != undefined && specification_expand.breakfast != 0) {
					breakfast = '含' + specification_expand.breakfast + '份早';
				} else {
					breakfast = '不含早';
				}
				// 计算使用的date
				var numberDate = new Date(joinTime.getTime());
				for (var i = 0; i < checkIn; i++) {
					
					var dataStr = numberDate.getFullYear() + '-' + (numberDate.getMonth() + 1) + '-' + numberDate.getDate();
					var html = '<div class="weui-form-preview__item">' +
						'	<label class="weui-form-preview__label">' + dataStr + breakfast + '</label>' +
						'	<span class="weui-form-preview__value">' + checkInNum + ' x ￥' + specification.price.toFixed(2) + '</span>' +
						'</div>';
					ul.append(html);
					numberDate.setDate(numberDate.getDate() + 1);
				}
				// 总价
				var html = '<div class="weui-form-preview__item">' +
					'	<label class="weui-form-preview__label">总价</label>' +
					'	<span class="weui-form-preview__value" style="color: #000; font-size: .35rem;" >￥' +(checkInNum * checkIn * specification.price).toFixed(2)+ '</span>' +
					'</div>';
				ul.append(html);
				// 通用积分支付
				var html = '<div class="weui-form-preview__item">' +
					'	<label class="weui-form-preview__label">通用积分</label>' +
					'	<span class="weui-form-preview__value">-￥' + basic.general_integral.toFixed(2) + '</span>' +
					'</div>';
				ul.append(html);
				// 代金卷
				var html = '<div class="weui-form-preview__item">' +
					'	<label class="weui-form-preview__label">代金券</label>' +
					'	<span class="weui-form-preview__value">-￥' + basic.send_integral.toFixed(2) + '</span>' +
					'</div>';
				ul.append(html);
				// 优惠券
				var html = '<div class="weui-form-preview__item">' +
					'	<label class="weui-form-preview__label">优惠券</label>' +
					'	<span class="weui-form-preview__value">-￥' + basic.coupon + '张</span>' +
					'</div>';
				ul.append(html);
				// 现金支付
				var html = '<div class="weui-form-preview__item">' +
					'	<label class="weui-form-preview__label">用户实付款</label>' +
					'	<span class="weui-form-preview__value" style="color: red; font-size: .35rem;" >￥' + basic.cash_amount.toFixed(
						2) + '</span>' +
					'</div>';
				ul.append(html);

				// 订单信息
				document.getElementById('order_info_id').innerHTML = basic.order_no + '<a class="orderId_copy">复制</a>';
				document.getElementById('order_info_submit_time').innerHTML = new Date(basic.submit_time).Format('yyyy-MM-dd hh:mm:ss');
				document.getElementById('order_info_pay_time').innerHTML = new Date(basic.pay_time).Format('yyyy-MM-dd hh:mm:ss');

				// 积分情况
				document.getElementById('level_less').innerHTML = '减少' + (checkInNum * checkIn * specification.price * (
					specification.gift_noun / 100)).toFixed(2);
				/*
				3-等待商家确认,
				4-商家已确认,
				5-商家已拒绝,
				6-用户取消订单
				*/
				var incomeStr = '';
				if (basic.state == 3) {
					incomeStr = '待入账';
					document.getElementById('income_tip').style.display = 'inline';
				}
				if (basic.state == 4 || basic.state == 0) {
					incomeStr = '已入账';
					document.getElementById('income_tip').style.display = 'none';
				}
				if (basic.state == 5 || basic.state == 6) {
					incomeStr = '已退款';
					document.getElementById('income_tip').style.display = 'none';
				}
				incomeStr += (checkInNum * checkIn * specification.price).toFixed(2);
				document.getElementById('income').innerHTML = incomeStr;
				// 退款信息
				if (refund.length > 0) {
					document.getElementById('refund_time').innerHTML = refund[0].refund_date_str;
				} else {
					document.getElementById('refund_div').style.display = 'none';
				}

				// 绑定拨打电话
				document.getElementById('register_mobile_div').addEventListener('click', function() {
					window.location.href = "tel://" + expand.mobile;
				}, false);

			}
		}
	});
}


function acceted() {
	plus.nativeUI.showWaiting("载入中")
	jQuery.support.cors = true;
	jQuery.ajax({
		url: mMain.url + "/wnk_business_app/v2.0.0/wnkOrderAccetedByHotel",
		type: "POST",
		dataType: 'json',
		data: {
			"businessId": storage['business_id'],
			"orderId": order_id,
			"type": 0
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			plus.nativeUI.closeWaiting();
			plus.nativeUI.toast(data.msg);
			if (data.status == 0) {
				//plus.webview.close("order_detail_hotel.html");
				location.reload();
			}
		}
	});
}

function cancel() {
	plus.nativeUI.showWaiting("载入中")
	jQuery.support.cors = true;
	jQuery.ajax({
		url: mMain.url + "/wnk_business_app/v2.0.0/wnkOrderRefundByHotel",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage['business_id'],
			"order_id": order_id,
			'refund_number': 1,
			'refund_reason': 0 
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			plus.nativeUI.closeWaiting();
			plus.nativeUI.toast(data.msg);
			if (data.status == 0) {
				plus.webview.close("order_detail_hotel.html");
			}
		}
	});
}
