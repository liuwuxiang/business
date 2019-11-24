var storage = null;
mui.init({
	swipeBack: true, //启用右滑关闭功能
});
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;
		// 获取所有分类
		getAllType();
		// 绑定新增分类点击事件
		document.getElementById("addTypeBtn").addEventListener('tap', function(e) {
			e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
			var btnArray = ['取消', '确定'];
			mui.prompt('请输入分类名称：', '请输入分类名称', '猛戳商家版', btnArray, function(e) {
				if(e.index == 1) {
					addType(e.value);
				}
			})
		});

		// 绑定分类删除事件
		mui('#type_ul').on('tap', '.delete_button', function() {
			var type_id = this.getAttribute('name');
			deleteType(type_id);
		});

		// 绑定分类编辑事件
		mui('#type_ul').on('tap', '.edit_button', function() {
			var type_id = this.getAttribute('name');
			setType(type_id);
		});
		
		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getAllType();
		});

	});


	//获取所有分类
	function getAllType() {
		toast(2, "打开loading");
		$("#type_ul li").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business_app/v1.0.0/getAllCommodityType',
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
						for(var index = 0; index < list.length; index++) {
							var obj = list[index];
							var html = "" +
								"<li>" +
								"	<a class=\"type_name\">" + obj.type_name + "</a>" +
								"	<div class=\"button_div\">" +
								"		<input type=\"button\" value=\"删除\" class=\"delete_button\" name=\"" + obj.id + "\"/>" +
								"		<input type=\"button\" value=\"修改\" class=\"edit_button\"   name=\"" + obj.id + "\"/>" +
								"	</div>" +
								"</li>";
							$("#type_ul").append(html);
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

	//添加分类
	function addType(type_name) {
		if(type_name == "" || type_name == undefined) {
			toast(1, "请输入分类名称");
		} else {
			toast(2, "打开loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/addCommodityType",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"type_name": type_name
				},
				success: function(data) {
					toast(3, "关闭loading");
					toast(1, data.msg);
					if(data.status == 0) {
						getAllType();
					} else if(data.msg == 1) {
						mMain.gotoLogin();
					} else {
						mui.toast(data.msg);
					}
				},
			});
		}
	}

	//删除分类事件
	function deleteType(type_id) {
		var btnArray = ['取消', '确定'];
		mui.confirm('删除分类将同步删除分类下商品,确认删除？', "猛戳商家版", btnArray, function(e) {
			if(e.index == 1) {
				deleteTypeNetwork(type_id)
				return true;
			} else {
				return false;
			}
		})
	}

	//修改分类事件
	function setType(type_id) {
		var btnArray = ['取消', '确定'];
		mui.prompt('请输入分类新名称：', '请输入分类新名称', '分类修改', btnArray, function(e) {
			if(e.index == 1) {
				if(e.value == '' || e.value == undefined) {
					mui.toast('分类名称不能为空');
					return;
				}
				setTypeNameNetwork(e.value, type_id);
			}
		})
	}

	//修改分类网络事件
	function setTypeNameNetwork(new_type_name, type_id) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/setCommodityTypeName",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"type_id": type_id,
				"new_type_name": new_type_name
			},
			success: function(data) {
				toast(3, "关闭loading");
				toast(1, data.msg);
				if(data.status == 0) {
					getAllType();
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//删除分类网络事件
	function deleteTypeNetwork(type_id) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/deleteCommodityType",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"type_id": type_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				toast(1, data.msg);
				if(data.status == 0) {
					getAllType();
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	
});