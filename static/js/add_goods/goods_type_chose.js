// 本地存储
var storage = null;
//商家是否执行万能卡权益
var make_wnk_state = -1;

mui.plusReady(function() {
	mui.ready(function() {
		// 初始化本地存储
		storage = window.localStorage;

		getAllCommodityType();

		// 绑定点击事件 - 进入分类管理
		document.getElementById('addGoodsType').addEventListener('tap', function() {
			joinGoodsTypeAdd();
		});

		// 绑定点击事件 - 分类点击
		mui('.fgroup').on('tap', 'label', function() {
			var type_id = this.getAttribute('id');
			joinGoodsAdd(type_id);
		});

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getAllCommodityType();
		});

	});

	//进入商品分类添加页面
	function joinGoodsTypeAdd() {
		mui.openWindow({
			url: '/web/goods/type_manager.html',
			id: 'type_manager.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			extras: {},
			createNew: true
		});
	}

	//进入商品添加页面
	function joinGoodsAdd(type_id) {
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
									"type_id": type_id,
									'type_operation': '1',//操作类型：0-修改；1-添加
								},
								createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
							});
							break;
						default:
							mui.openWindow({
								url: '/web/goods/add_commodity.html',
								id: 'add_commodity.html',
								styles: {
									top: '0px',
									bottom: '51px',
								},
								extras: {
									"type_id": type_id,
								},
								createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
							});
					}
				}
			},
		});
	}

	//获取所有商品分类
	function getAllCommodityType() {
		toast(2, "打开loading");

		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getAllCommodityType",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				$(".fgroup label").remove();
				toast(3, "关闭loading");
				if(data.status == 0) {
					var list = data.data;
					if(list.length <= 0) {
						toast(1, "暂无数据");
						mui.confirm('你暂无商品分类,是否添加?', '猛戳商家版', ['取消', '添加'], function(e) {
							if(e.index == 0) {

							} else {
								joinGoodsTypeAdd();
							}
						});
					} else {
						var firstControlId = "";
						var firstTypeId = -1;
						for(var index = 0; index < list.length; index++) {
							var obj = list[index];
							var html = "<label class=\"fradio\" id=\"" + obj.id + "\">" +
								"<span class=\"fname\">" + obj.type_name + "</span>" +
								"<input type=\"radio\" name=\"goods_type\">" +
								"<span class=\"status\"></span>" +
								"</label>";
							$(".fgroup").append(html);
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

});