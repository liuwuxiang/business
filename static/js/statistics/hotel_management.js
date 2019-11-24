var storage = window.localStorage;

// 商品ID 数组
var goodsIdArr = [];

var goodsId;
var time;

mui.init();

mui.plusReady(function() {
	mui.ready(initData);
});

function initData() {

	// 绑定表单点击事件
	mui('tbody').on('tap', 'td', function() {
		if(!selectDateType(this.innerText)) {
			window.event ? window.event.cancelBubble = true : e.stopPropagation();
			popUpInput(this.getAttribute('data-id'), this.getAttribute('data-time'));
		}
	});

	// 关闭当前房间
	document.getElementById('input_close').addEventListener('tap', function() {
		mask._remove();
		maskClose();
		submitHotelManagement(goodsId, time, 0);
		$('#input_close').unbind();
	}, false)

	// 无限库存
	document.getElementById('input_max').addEventListener('tap', function() {
		mask._remove();
		maskClose();
		// TODO 执行数据保存
		submitHotelManagement(goodsId, time, -1);
	}, false)

	document.getElementById('inpit_customize').addEventListener('tap', function() {
		$('#input-div input').blur();
		setTimeout(function() {
			$('#input-div input').focus();
		}, 1);
	}, false)
	// 点击OK键
	document.getElementById('input_ok').addEventListener('tap', function() {
		mask._remove();
		maskClose();
		// TODO 执行数据保存
		submitHotelManagement(goodsId, time, document.getElementById('inventory').value);
	}, false);

	// 初始化表头
	selectBusinessGoodsInfoByBusinessId();

}

/**
 * 返回数据类型
 * false - 是数据列
 * true  - 是第一列
 * @param {Object} str 需要判断的字符串
 */
function selectDateType(str) {
	return parseInt(str.search(/\d{2}-\d{2}/)) === -1 ? false : true;
}

/**遮罩层*/
var mask = null;

/**
 * 弹出输入框
 */
function popUpInput(goods_id, time_stamp) {

	// 防止手机弹出输入法是tar跟着跑
	plus.webview.currentWebview().setStyle({
		height: 'd'
	});
	mask = mui.createMask(maskClose);
	mask.show(); //显示遮罩
	document.getElementById('input-div').style.display = 'inline';
	$('#input-div form')[0].reset();
	$('#input-div input').focus();

	// 先移除所有事件 
	document.getElementById('popUp_title').innerHTML = formatDateTime(time_stamp / 1000);

	goodsId = goods_id;
	time = time_stamp;

}

/**
 * 关闭遮罩层
 */
function maskClose() {
	document.getElementById('input-div').style.display = 'none';
}

/**
 * 获取商家所有商品信息 用于初始化表头(未删除且启用了的)
 */
function selectBusinessGoodsInfoByBusinessId() {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectCommoditiesInfoByBusinessId",
		type: "POST",
		dataType: 'json',
		data: {
			"businessId": storage["business_id"],
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(data.status == 0 && data.data != undefined && data.data != null && data.data.length > 0) {
				var head = $('thead > tr');
				head.empty();
				var html = '<th id="date_select">' +
					'	<p>' + new Date().getFullYear() + '年</p>' +
					'	<p>' + (new Date().getMonth() + 1) + '月</p>' +
					'	<div><img src="../../static/images/wnk_business/down_arrow.png"></div>' +
					'</th>';
				head.append(html);
				for(var i = 0; i < data.data.length; i++) {
					var obj = data.data[i];
					var html = '<th>' + obj.name + '</th>';
					head.append(html);
					goodsIdArr.push(obj.id);
				}
				document.getElementById('date_select').addEventListener('click', showPick, false);
				selectBusinessGoodsInventoryByBusinessId(new Date().getMonth());
			}
		},
	});
}

var weekday = ['周末', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * 查询商品库存信息(30天的)
 * 参数1 ： 开始的日期的时间戳
 */
function selectBusinessGoodsInventoryByBusinessId(time_stamp) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectCommoditiesInventoryByBusinessId",
		type: "POST",
		dataType: 'json',
		data: {
			"businessId": storage["business_id"],
			'start_time_stamp': time_stamp
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(data.status == 0) {
				var tableContent = $('#table-content');
				tableContent.empty();
				// 获取日期
				var date = new Date();
				// 判断是否是最后一个月
				if((date.getMonth() + 6) == time_stamp || date.getMonth() != time_stamp){
					date.setDate(1);
					date.setMonth(time_stamp);
				}
				for(var i = 0; i < data.data.length; i++) {
					var obj = data.data[i];
					var html = '<tr>' +
						'<td class="td-one td-days">' +
						'	<p>' + (date.getMonth() + 1) + '-' + date.getDate() + '</p>' +
						'	<p>' + weekday[date.getDay()] + '</p>';
					if((new Date().getTime() - date.getTime()) > 0) {
						html += '<p>今天</p>';
					}

					html += '</td>';

					for(var j = 0; j < obj.length; j++) {
						// 商品ID 
						// 日期时间戳
						var id = goodsIdArr[j];
						var timeStamp = Date.parse(date);
						if(obj[j] == -1) {
							html += '<td data-id="' + id + '" data-time="' + timeStamp + '">-</td>';
						} else if(obj[j] == -0) {
							html += '<td data-id="' + id + '" data-time="' + timeStamp +
								'" ><img src="../../static/images/wnk_business/delete.png"></td>';
						} else {
							html += '<td class="td-number" data-id="' + id + '" data-time="' + timeStamp + '" >' + obj[j] + '间</td>';
						}
					}
					html += '</tr>';
					tableContent.append(html);

					// 日期+1
					date.setDate(date.getDate() + 1);
				}
			}
		}

	});
}

/**
 * 十位时间戳格式化为yyyy-MM-dd的格式
 */
function formatDateTime(timeStamp) {
	var date = new Date();
	date.setTime(timeStamp * 1000);
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	var second = date.getSeconds();
	minute = minute < 10 ? ('0' + minute) : minute;
	second = second < 10 ? ('0' + second) : second;
	return y + '-' + m + '-' + d;
}

/**
 * 房态管理插入
 */
function submitHotelManagement(goodsId, timeStamp, inventory) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/insertOrUpdateHotelManagement",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			'commodities_id': goodsId,
			'time_stamp': timeStamp,
			'inventory_num': inventory
		},
		success: function(data) {
			toast(3, "关闭loading");
			plus.nativeUI.toast(data.msg);
			if(parseInt(data.status) === 0) {
				location.reload();
			}
		},
	});

}

/**
 * 弹出选择器,选择一个月之内的
 */
function showPick() {
	var picker = new mui.PopPicker();
	var date = new Date();
	var valueArr = [];
	for(var i = 0; i <= 6; i++) {
		valueArr.push({
			value: i,
			text: date.getMonth() + 1 + i + '月'
		});
	}
	picker.setData(valueArr);
	document.documentElement.style.overflow = 'hidden';
	picker.show(SelectedItemsCallback)
}

function SelectedItemsCallback(value) {
	console.log(value[0].value);
//	var d = new Date();
//	d.setMonth(value[0].value);
	value[0].value = value[0].value + 1;
	selectBusinessGoodsInventoryByBusinessId(value[0].value);
	$('thead > tr > th > p')[1].innerHTML = (value[0].value + 1) + '月';

}