var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	var opertionType = -1;
	var commodity_id = -1;


	mui.ready(function() {
		
		storage = window.localStorage;
		
		var self = plus.webview.currentWebview();
		commodity_id = self.commodity_id; //获得参数
		optionClick(0);
		// 绑定列表切换事件
		mui('.wrap').on('tap', '.item', function() {
			var index = this.getAttribute('id');
			if(String(index) === 'new_order') {
				optionClick(0);
			} else {
				optionClick(1);
			}
		})
		
		// 绑定添加标签事件
		document.getElementById('add').addEventListener('tap', addAction);

		mui('.specification_ul').on('tap', '.startOrEndGuiGe', function() {
			var guige_id = this.getAttribute('name');
			startOrEndGuiGe(guige_id);
		})

		mui('.specification_ul').on('tap', '.setAction', function() {
			var arr = this.getAttribute('name');
			arr = arr.split('|');
			setAction(arr[0], arr[1]);
		})
	
		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			optionClick(0);
		});
	});

	//选项切换事件(0-已启用,1-未启用)
	function optionClick(index) {
		opertionType = index;
		if(index == 0) {
			document.getElementById("new_order").setAttribute("class", "item sel");
			document.getElementById("finish_order").setAttribute("class", "item");
			getCommodityGuiGe(index);
		} else {
			document.getElementById("finish_order").setAttribute("class", "item sel");
			document.getElementById("new_order").setAttribute("class", "item");
			getCommodityGuiGe(index);
		}

	}

	//获取商品标签
	function getCommodityGuiGe(type) {
		toast(2, "打开loading");
		$("#specification_ul li").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessGoodsTag",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				'type'       : type
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					var list = data.data;
					var button_name = "";
					if(type == 0) {
						button_name = "停用";
					} else {
						button_name = "启用";
					}
					for(var index = 0; index < list.length; index++) {
						var obj = list[index];
						var html = "<li>" +
							"<a class=\"specification_name\">规格名称:" + obj.name + "</a>" +
							"<div class=\"button_div\">" +
							"<input type=\"button\" value=\"修改\" class=\"setAction\" name=\"" + obj.id + "|" + obj.name + "\"/>" +
							"<input type=\"button\" value=\"" + button_name + "\" class=\"startOrEndGuiGe\"  name=\"" + obj.id + "\" />" +
							"</div>" +
							"</li>";
						$("#specification_ul").append(html);
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//添加按钮事件
	function addAction() {
		var btnArray = ['取消', '确定'];
		mui.prompt('请输入商品标签名称：', '请输入商品标签名称', '添加商品标签', btnArray, function(e) {
			if(e.index == 1) {
				var name = e.value;
				if(name == undefined || name == "") {
					toast(1, "未输入标签名称");
				} else {
					addGuiGeNetwork(name);
				}
			}
		})
	}

	//添加标签网络事件
	function addGuiGeNetwork(guige_name) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/insertBusinessGoodsTag",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"name"       : guige_name, 
			},
			success: function(data) {
				toast(3, "关闭loading");
				toast(1, data.msg);
				if(data.status == 0) {
					optionClick(0);
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//修改商品标签事件
	function setAction(guige_id, specifications_name) {
		var btnArray = ['取消', '确定'];
		mui.prompt('请输入商品标签名称：', specifications_name, '修改商品标签', btnArray, function(e) {
			if(e.index == 1) {
				var name = e.value;
				if(name == undefined || name == "") {
					toast(1, "未输入标签名称");
				} else {
					setGuiGeName(name, guige_id);
				}
			}
		})
	}

	//修改标签信息名称网络事件
	function setGuiGeName(guige_name, guige_id) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/updateBusinessGoodsTag",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"id"         : guige_id,
				"name"       : guige_name
			},
			success: function(data) {
				toast(3, "关闭loading");
				toast(1, data.msg);
				if(data.status == 0) {
					optionClick(opertionType);
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//停用/启用商品标签
	function startOrEndGuiGe(guige_id) {
		if(opertionType == 0) {
			var btnArray = ['取消', '确认'];
			mui.confirm('确认停用此商品标签？', '停用商品标签', btnArray, function(e) {
				if(e.index == 1) {
					startOrEndGuiGeNetwork(guige_id, 1);
				}
			})
		} else {
			var btnArray = ['否', '是'];
			mui.confirm('确认启用此标签？', '启用商品标签', btnArray, function(e) {
				if(e.index == 1) {
					startOrEndGuiGeNetwork(guige_id, 0);
				}
			})
		}
	}

	//启用/停用规格网络事件
	function startOrEndGuiGeNetwork(guige_id, type) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/updateBusinessGoodsTag",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"id"         : guige_id,
				"state"      : type
			},
			success: function(data) {
				toast(3, "关闭loading");
				toast(1, data.msg);
				if(data.status == 0) {
					optionClick(type);
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

});