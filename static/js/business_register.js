var storage = null;
//启用右滑关闭功能
mui.init({
	swipeBack: true
});
mui.plusReady(function() {
	
	plus.webview.close(plus.webview.getWebviewById('protocol.html'),'none');
	
	//当前图片index值
	var currentPhotoIndex = -1;

	// 店铺区域pricker
	var area_select_pricker;
	// 店铺分类区域
	var business_type_select_pricker;

	// 初始化方法
	mui.ready(function() {
		// 本地存储
		storage = window.localStorage;
		/*

		
		// 获取商家分类
		getBusinessType();
		// 事件绑定
		document.getElementById('floadimgbut').addEventListener('click', function() {
			choosePhoto(0);
		})
		document.getElementById('floadimgbut2').addEventListener('click', function() {
			choosePhoto(1);
		})
		document.getElementById('floadimgbut3').addEventListener('click', function() {
			choosePhoto(2);
		})
		document.getElementById('businessRegister').addEventListener('click', businessRegister);
		document.getElementById('header_file').addEventListener('change', chooseHeaderChangeFile);
		document.getElementById('header_file2').addEventListener('change', chooseHeaderChangeFile2);
		document.getElementById('header_file3').addEventListener('change', chooseHeaderChangeFile3);
		
		// 绑定图片删除事件
		mui('#lunbo_photo_ul').on('click', '.delete_button', function() {
			var name = this.getAttribute('name');
			deletePhotoLi(name);
		});
		*/
		
		//初始化店铺区域选择列表	
		initAreaselect();
		// 绑定店铺区域选择 点击事件
		document.getElementById('area_select').addEventListener('tap', function() {
			area_select_pricker.show(function(item) {
				document.getElementById('area_select').value = item[0].value;
			});
		}, false);
		// 初始化店铺分类选择列表
		// 获取商家分类 并且 初始化店铺分类选择列表
		getBusinessType();
		document.getElementById('business_type_select').addEventListener('tap',function(){
			business_type_select_pricker.show(function(item) {
				document.getElementById('business_type_select_value').value = item[0].value;
				document.getElementById('business_type_select').value = item[0].text;
			});
		});
		
		// 注册按钮点击事件
		document.getElementById('businessRegister').addEventListener('tap',businessRegister);
	});

	/**
	 * 初始化店铺区域选择列表	
	 */
	function initAreaselect() {
		area_select_pricker = new mui.PopPicker();
		area_select_pricker.setData([{
			value: "城中",
			text: "城中"
		}, {
			value: "城东",
			text: "城东"
		}, {
			value: "城西",
			text: "城西"
		}, {
			value: "城南",
			text: "城南"
		}, {
			value: "城北",
			text: "城北"
		}]);
	}
	
	function initBusinessTypePricker(data){
		business_type_select_pricker = new mui.PopPicker();
		business_type_select_pricker.setData(data);
	}



	//获取万能卡商家分类
	function getBusinessType() {
		toast(2, "开启loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessType",
			type: "POST",
			dataType: 'json',
			success: function(data) {
				toast(3, "关闭loading");
				if (data.status == 0) {
					var prickerDate = new Array();
					var list = data.data;
					for (var index = 0; index < list.length; index++) {
						var obj = list[index];
						prickerDate[index] = {
							value:obj.id,
							text :obj.name
						}
// 						var html = "<option value=\"" + obj.id + "\">" + obj.name + "</option>";
// 						$("#business_type_select").append(html);
					}
					// 初始化店铺分类
					initBusinessTypePricker(prickerDate);
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}


	//注册和绑定
	function businessRegister() {
		// 推荐人
		var recommend_mobile = document.getElementById("recommend_mobile").value;
		// 店铺名称
		var store_name       = document.getElementById("store_name").value;
		// 店铺分类
		var business_type_id = document.getElementById("business_type_select_value").value;
		// 店铺区域
		var area             = document.getElementById("area_select").value;
		// 店铺地址
		var address          = document.getElementById("address").value;
		// 店铺登录手机号
		var login_account    = document.getElementById("login_account").value;
		// 店铺联系人
		var contact_name     = document.getElementById("contact_name").value;
		// 店铺联系电话
		var mobile           = document.getElementById("mobile").value;
		// 店铺描述
		var store_describe   = document.getElementById("store_describe").value;

		if (recommend_mobile == ""      || recommend_mobile == undefined) {
			mui.toast("请输入推荐商家手机号");
		} else if (store_name == ""     || store_name == undefined) {
			mui.toast("请输入店铺名称");
		} else if (address == ""        || address == undefined) {
			mui.toast("请输入店铺地址");
		} else if (login_account == ""  || login_account == undefined) {
			mui.toast("请输入登录手机号");
		} else if (contact_name == ""   || contact_name == undefined) {
			mui.toast("请输入联系人");
		} else if (mobile == ""         || mobile == undefined) {
			mui.toast("请输入联系电话");
		} else if (store_describe == "" || store_describe == undefined) {
			mui.toast("请输入店铺描述");
		} else if(business_type_id == "" || business_type_id == undefined){
			mui.toast("请选择店铺分类");
		} else {
			toast(2, "打开loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/wnkBusinessRegister",
				type: "POST",
				dataType: 'json',
				data: {
					"recommend_mobile": recommend_mobile,
					"store_name"      : store_name,
					"type_id"         : business_type_id,
					"area"            : area,
					"address"         : address,
					"login_account"   : login_account,
					"contact_name"    : contact_name,
					"contact_mobile"  : mobile,
					"miaoshu"         : store_describe
				},
				success: function(data) {
					toast(3, data.msg);
					if(data.status == 0) {
						mui.confirm(data.msg, '猛戳商家版', ['确认'], function() {
							mMain.gotoLogin();
						},'div');
					} else {
						mui.confirm(data.msg, '猛戳商家版', ['确认'], function() {
							
						},'div');
					}
				},
				error:function(a,b,c){
					console.log(JSON.stringify(a));
					console.log(b);
					console.log(c);
				}
			});
		}

	}
	//删除轮播图li标签
	function deletePhotoLi(index) {
		$("#photo" + index).remove();
	}
});
