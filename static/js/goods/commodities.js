// 本地存储
var storage = null;

var lastClickTypeIdName = "";

mui.init({
	swipeBack: true, //启用右滑关闭功能
	pullRefresh: {
		container: '#slider',
		down: {
			style: 'circle',
			callback: pullupRefresh,
		},
	}
});

function pullupRefresh() {
	getAllCommodityType();
	mui('#slider').pullRefresh().endPulldownToRefresh();
}

mui.plusReady(function() {
	mui.ready(function() {
		// 初始化本地存储
		storage = window.localStorage;
		// 计算宽高
		var screenHeight = plus.screen.resolutionHeight;
		var height = screenHeight * 0.9;
		var commodityHeight = screenHeight * 0.75;

		document.getElementById("content_div").style.height = height - 51 + "px";
		document.getElementById("commodities_type_ul").style.height = height - 51 + "px";

		// 获取所有分类
		getAllCommodityType();
		// 绑定事件
		binding();

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getAllCommodityType();
			mMain.selectBusinessLegalize();
		});

		document.getElementById('content_div').addEventListener('swipeup', function(event) {
			plus.webview.currentWebview().setPullToRefresh({
				support: false
			});
		});
		document.getElementById('content_div').addEventListener('swipedown', function(event) {
			plus.webview.currentWebview().setPullToRefresh({
				support: true,
				style: "circle"
			});
		});
		document.getElementById('commodities_type_ul').addEventListener('swipeup', function(event) {
			plus.webview.currentWebview().setPullToRefresh({
				support: false
			});
		});
		document.getElementById('commodities_type_ul').addEventListener('swipedown', function(event) {
			plus.webview.currentWebview().setPullToRefresh({
				support: true,
				style: "circle"
			});
		});
	});
});

// 绑定事件
function binding() {
	// 绑定点击事件 - 进入新添加商品页面-分类选择
	document.getElementById('popUpMenu2').addEventListener('tap', function() {
		mui.openWindow({
			url: '/web/add_goods/goods_type_chose.html',
			id: 'goods_type_choose.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			createNew: true
		});

	});

	// 绑定点击事件 -  分类管理点击事件
	document.getElementById('commodity_type_manager').addEventListener('tap', function() {
		mui.openWindow({
			url: '/web/goods/type_manager.html',
			id: 'type_manager.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			createNew: true,
		});
	});

	// 绑定点击事件 - 修改商品
	mui('#content1').on('tap', '.set_commodity', function() {
		var commodity_id = this.getAttribute('name');
		setCommodity(commodity_id);
	});

	// 绑定点击事件 - 删除商品
	mui('#content1').on('tap', '.delete_commodity', function() {
		var commodity_id = this.getAttribute('name');
		deleteCommodity(commodity_id);
	});
}

//分类点击事件
function typeClick(id_name, type_id) {
	if(lastClickTypeIdName != "") {
		document.getElementById(lastClickTypeIdName).setAttribute("class", " type_li");
	}
	document.getElementById(id_name).setAttribute("class", " type_li type_sel");
	lastClickTypeIdName = id_name;
	getAllCommodityByTypeId(type_id);
}

//获取所有商品分类
function getAllCommodityType() {
	toast(2, "打开loading");
	lastClickTypeIdName = "";
	$("#commodities_type_ul li").remove();
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getAllCommodityType",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(data.status == 0) {
				var list = data.data;
				if(list.length <= 0) {
					toast(1, "暂无数据");
				} else {
					var firstControlId = "";
					var firstTypeId = -1;
					for(var index = 0; index < list.length; index++) {
						var obj = list[index];
						var html = '' +
							'<li class="type_li" id="type_li_' + obj.id + '" name="' + obj.id + '">' +
							'	<a class="type_name">' + obj.type_name + '</a>                     ' +
							'</li>';
						$("#commodities_type_ul").append(html);
						// 绑定点击事件
						document.getElementById('type_li_' + obj.id).addEventListener('tap', function() {
							var id_name = this.getAttribute('id');
							var type_id = this.getAttribute('name');
							typeClick(id_name, type_id);
						});
					}
					typeClick('type_li_' + data.data[0].id, data.data[0].id);
				}
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
			}
		},
	});
}

//获取某个分类下的商品
function getAllCommodityByTypeId(type_id) {
	toast(2, "打开loading");
	$("#content1 li").remove();
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getAllCommodityByTypeId",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"type_id": type_id
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(data.status == 0) {
				var list = data.data;
				if(list.length <= 0) {
					toast(1, "暂无数据");
				} else {
					for(var index = 0; index < list.length; index++) {
						var obj = list[index];
						if (obj.commodity_describe == undefined){
							obj.commodity_describe = ' ';
						}
						if( obj.goods_tag  == undefined ){
							obj.goods_tag  = ' ';
						}
						var html = '' +
							'<li name="' + obj.id + '" >' +
							'	<img src="' + obj.img_path + obj.photo.split("|")[0] + '">' +
							'	<div class="commodity_information_div">' +
							'		<a class="commodity_name_tag">' + obj.name + '</a>' +
							'		<a class="commodity_describe">' + obj.commodity_describe + '</a>' +
							'		<a class="month_sale_tag">' + obj.state_str + '</a>' +
							'		<a class="commodity_price_tag">￥' + obj.price + '</a>' +
							'	    <a class="month_sale_tag tag">' + obj.goods_tag + '</a>' +
							'	</div>' +
							'<input type="button" value="删除" class="delete_commodity" name="' + obj.id + '" >' +
							'	<input type="button" value="修改" class="set_commodity" name="' + obj.id + '" >' +
							'</li>';

						$("#content1").append(html);
					}
				}
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
			}
		},
	});
}

//商品规格点击事件
function commodity_guige(commodity_id) {
	window.event.cancelBubble = true; //停止冒泡
	window.event.returnValue = false; //阻止事件的默认行为
	mui.openWindow({
		url: './commodity_specifications.html',
		id: 'commodity_specifications.html',
		styles: {
			top: '0px',
			bottom: '51px',
		},
		extras: {
			'commodity_id': commodity_id
		},
		createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
	});
}

//修改商品
function setCommodity(commodity_id) {
	
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessTypeByBusinessId",
		type: "POST",
		dataType: 'json',
		data: {
			"businessId": storage["business_id"],
		},
		success: function(data) {
			toast(3, "关闭loading");
			console.log(JSON.stringify(data));
			var obj = data.data;
			if(parseInt(data.status) === 0) {
				switch(String(data.data.name)) {
					//酒店类添加商品页面单独写
					case '酒店':
						mui.openWindow({
							url: '/web/goods/add_hotel.html',
							id: 'add_hotel.html',
							styles: {
								top: '0px',
								bottom: '51px',
							},
							extras: {
								'commodity_id': commodity_id,
								'type_operation': '0',//操作类型：0-修改；1-添加
							},
							createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
						});
						break;
					default:
						mui.openWindow({
							url: '/web/goods/set_commodity.html',
							id: 'set_commodity.html',
							styles: {
								top: '0px',
								bottom: '51px',
							},
							extras: {
								'commodity_id': commodity_id,
							},
							createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
						});
				}
			}
		},
	});
	
}

//删除商品
function deleteCommodity(commodity_id) {
	var btnArray = ['取消', '确定'];
	mui.confirm('确定删除此商品,确认删除？', "猛戳商家版", btnArray, function(e) {
		if(e.index == 1) {
			//确定
			toast(2, "打开loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/updateDeleteStateByCommodityId",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"commodity_id": commodity_id
				},
				success: function(data) {
					toast(3, "关闭loading");
					if(data.status == 0) {
						mui.toast(data.msg);
						var type_id = data.data.type_id;
						getAllCommodityByTypeId(type_id);
					} else if(data.status == 2) {
						mMain.gotoLogin();
					} else {
						mui.toast(data.msg);
					}
				},
			});
			return true;
		} else {
			return false;
		}
	})
}