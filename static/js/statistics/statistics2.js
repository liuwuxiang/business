var storage = null;
// 今日总收入
var today_revenue = null;
// 收款笔数
var total = null;
// 收款金额
var money = null;

//店铺名称
var store_name = null;

mui.init({
	pullRefresh: {
		container: '#slider',
		down: {
			style: 'circle',
			callback: pullupRefresh,
			height: '2rem', //可选,默认50px.下拉刷新控件的高度,
			range: '2rem', //可选 默认100px,控件可下拉拖拽的范围
			offset: '0px', //可选 默认0px,下拉刷新控件的起始位置
		},
	}
});

mui.plusReady(function() {
	mui.ready(function() {
		// 初始化本地存储
		storage = window.localStorage;
		// 初始化控件
		today_revenue = document.getElementById('today_revenue');
		total = document.getElementById('total');
		money = document.getElementById('money');
		store_name = document.getElementById('store_name');
		// 初始化获取数据
		getTodayRevenue();
		getRevenueTotalAndMoney();
		// 获取商家类型
		getWnkBusinessType();
		// 绑定收款记录点击事件
		document.getElementById('collection_record').addEventListener('tap', function() {
			mui.openWindow({
				url: './incomeNotes.html',
				id: 'incomeNotes.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNew: true,
				show: {
					aniShow: 'none', //页面显示动画，默认为”slide-in-right“；
				},
				waiting: {
					autoShow: true, //自动显示等待框，默认为true
				}
			});
		});
		// 绑定销售分析点击事件
		document.getElementById('sales_analysis').addEventListener('click', function() {
			mui.openWindow({
				url: './order_static_detail2.html',
				id: 'order_static_detail.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNew: true,
				show: {
					aniShow: 'none', //页面显示动画，默认为”slide-in-right“；
				},
				waiting: {
					autoShow: true, //自动显示等待框，默认为true
				}
			});
		});
		//会员管理点击事件
		document.getElementById('member_management').addEventListener('tap', function() {
			mui.openWindow({
				url: './member_management.html',
				id: 'member_management.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNes: true,
				show: {
					aniShow: 'none',
				},
				waiting: {
					autoShow: true,
				}
			});
		});
		//房态管理点击事件
		document.getElementById('hotel_management').addEventListener('tap', function() {
			mui.openWindow({
				url: './hotel_management.html',
				id: 'hotel_management.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNes: true,
			});
		});


		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			// 初始化获取数据
			getTodayRevenue();
			getRevenueTotalAndMoney();
			mMain.selectBusinessLegalize();
			getWnkBusinessType();
		});
	})
})

// 下拉刷新处理
function pullupRefresh() {
	getTodayRevenue();
	getRevenueTotalAndMoney();
	mui('#slider').pullRefresh().endPulldownToRefresh();
}

//  获取今日总收入
function getTodayRevenue() {
	toast(2,"打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getTodayRevenue",
		type: "POST",
		dataType: 'json',
		timeout : 10000, 
		data: {
			'business_id': storage['business_id']
		},
		success: function(data) {
			toast(3,"关闭loading");
			if(data.status == 0 && data.data == null) {
				today_revenue.innerHTML = '¥0.00';
				store_name.innerHTML = '';
			} else if(data.status == 0) {
				today_revenue.innerText = '¥' + parseFloat(data.data.money).toFixed(2);
				store_name.innerHTML = data.data.store_name;
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				plus.nativeUI.toast(data.msg);
			}
		},
		error : function(XMLHttpRequest,status){
			toast(3,"关闭loading");
			if(status == 'timeout'){
				plus.nativeUI.toast("连接超时,请重试");
			} else {
				plus.nativeUI.toast("连接出错,请重试");
			}
		}
	});
}

/**
 * 获取收款笔数和收款金额
 */
function getRevenueTotalAndMoney() {
	toast(2,"打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getRevenueTotalAndMoney",
		type: "POST",
		dataType: 'json',
		timeout : 10000, 
		data: {
			'business_id': storage['business_id']
		},
		success: function(data) {
			toast(3,"关闭loading");
			if(data.status == 0 && data.data == null) {
				total.innerHTML = '0';
				money.innerHTML = '¥0.00';
			} else if(data.status == 0) {
				total.innerHTML = data.data.total;
				money.innerHTML = '¥' + parseFloat(data.data.money).toFixed(2);
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				plus.nativeUI.toast(data.msg);
			}
		},
		error : function(XMLHttpRequest,status){
			toast(3,"关闭loading");
			if(status == 'timeout'){
				plus.nativeUI.toast("连接超时,请重试");
			} else {
				plus.nativeUI.toast("连接出错,请重试");
			}
		}
	});
}

function getWnkBusinessType(){
	toast(2,"打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectWnkBusinessTypeNameByBusiness",
		type: "POST",
		dataType: 'json',
		timeout : 10000, 
		data: {
			'business_id': storage['business_id']
		},
		success: function(data) {
			toast(3,"关闭loading");
			if(data.status == 0 && data.data != null) {
				if(String(data.data) === '健身'){
					document.getElementById('member_management').style.display = "inline"
				} else {
					document.getElementById('member_management').style.display = "none"
				}
				if(String(data.data) === '酒店'){
					document.getElementById('hotel_management').style.display = "inline"
				} else {
					document.getElementById('hotel_management').style.display = "none"
				}
				
			} else {
				document.getElementById('member_management').style.display = "none"
				document.getElementById('hotel_management').style.display = "none"
			}
		},
		error : function(XMLHttpRequest,status){
			toast(3,"关闭loading");
			if(status == 'timeout'){
				plus.nativeUI.toast("连接超时,请重试");
			} else {
				plus.nativeUI.toast("连接出错,请重试");
			}
			document.getElementById('member_management').style.display = "none"
		}
	});
}