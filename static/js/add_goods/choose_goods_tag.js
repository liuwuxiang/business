// 本地存储
var storage = null;
//当前商品ID
var current_goods_id = -1;
//商品分类id
var goods_type_id = -1;

mui.plusReady(function() {
	mui.ready(function() {
		plus.webview.close(plus.webview.getWebviewById('add_commodity.html'), 'none');
		plus.webview.close(plus.webview.getWebviewById('goods_type_choose.html'), 'none');
		// 初始化本地存储
		storage = window.localStorage;
		var self = plus.webview.currentWebview();
		current_goods_id = self.commodity_id; //获得参数
		goods_type_id = self.type_id;
		initGoodsTagInfo();

		// 绑定点击事件 - 进入分类管理
		document.getElementById('addGoodsTag').addEventListener('tap', function() {
			joinGoodsTagAdd();
		});

		// 绑定点击事件 - 完成按钮事件
		document.getElementById('finishCommodityAdd').addEventListener('tap', function() {
			goodsTagAddFinish();
		});

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			initGoodsTagInfo();
		});
	});

	//进入商品标签添加页面
	function joinGoodsTagAdd() {
		mui.openWindow({
			url: '/web/goods/business_goods_tag.html',
			id: 'business_goods_tag.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			extras: {},
			createNew: true
		});
	}

	//标签添加完成事件
	function goodsTagAddFinish() {
		//var tag_checkboxs = document.getElementsByName("tag_checkbox");
		var tag_checkboxs = document.getElementsByClassName('tag_checkbox');
		var tag_ids = new Array();
		for(var index = 0; index < tag_checkboxs.length; index++) {
			var obj = tag_checkboxs[index];
			if(obj.checked == true) {
				var inputId = obj.name;
				console.log(obj.name);
				tag_ids.push(inputId.replace("tag_", ""));
			}
		}

		if(tag_ids.length > 0) {
			console.log("选中标签id=" + tag_ids.join(','));
			toast(2, "打开loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/updateBusinessGoodsTagAction",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"goods_id": current_goods_id,
					"goods_tag_ids": tag_ids.join(',')
				},
				success: function(data) {
					if(data.status == 0) {
						mui.toast("添加商品标签成功");
						setTimeout(function() {
							toast(3, "关闭loading");
							mMain.back();
							//							plus.webview.close("choose_goods_tag.html", 'none');
							plus.webview.close("set_commodity.html",'none');
						}, 1000);
					} else if(data.status == 2) {
						mMain.gotoLogin();
					} else {
						mui.toast(data.msg);
					}
				},
			});
		} else {
			mui.confirm('确定不选择商品标签?', '猛戳商家版', ['取消', '确定'], function(e) {
				if(e.index == 0) {

				} else {
					toast(2, "打开loading");
					mui.toast("添加商品标签成功");
					setTimeout(function() {
						toast(3, "关闭loading");
						mMain.back();
						plus.webview.close("set_commodity.html",'none');
					}, 1000);
				}
			});
		}
	}

	//获取商品标签
	function initGoodsTagInfo() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessGoodsTag",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				'type': '0'
			},
			success: function(data) {
				$(".goods_tag label").remove();
				toast(3, "关闭loading");
				if(data.status == 0) {
					if(data.data != undefined || data.data != null && data.data.length > 0) {
						var dataArr = [];
						for(var i = 0; i < data.data.length; i++) {
							var html = "<label class=\"weui-cell weui-check__label\" for=\"tag_" + data.data[i].id + "\">" +
								"<div class=\"weui-cell__hd\">" +
								"<input type=\"checkbox\" class=\"weui-check tag_checkbox\" name=\"" + data.data[i].name + "\" id=\"tag_" + data.data[i].id + "\">" +
								"<i class=\"weui-icon-checked\"></i>" +
								"</div>" +
								"<div class=\"weui-cell__bd\">" +
								"<p>" + data.data[i].name + "</p>" +
								"</div>" +
								"</label>";
							$(".goods_tag").append(html);
						}

					} else {
						mui.confirm('你暂无商品标签,是否添加?', '猛戳商家版', ['取消', '添加'], function(e) {
							if(e.index == 0) {

							} else {
								joinGoodsTagAdd();
							}
						});
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