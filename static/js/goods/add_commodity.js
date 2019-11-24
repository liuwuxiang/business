var storage = null;

var popupState = {
	//弹窗状态(false-未打开,1-已打开)
	popup_state: false,
}

//记录是哪个商品规格的消费赠送比例
var item_donation_ratio = '';

var recording = 1;

// 是否执行万能卡
var wnk_type_state = -1;

// 折扣方式
var wnk_type_discount_str = '';

var currentPhotoIndex = -1;
//数组保存规格名称(用以添加新的规格)
var allGuigeName = new Array();

//规格价格、赠送比例(用于计算额外赠送的现金券数量)
var input_price = 0;
var input_donation_ratio = 0;

mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	//商品图片id
	var commodityPhotoId = "";
	//0-上架,1-下架
	var commodityState = 0;
	//是否有商品分类(-1-没有,0-有)
	var isHaveCommodityType = -1;
	//0-不允许万能卡消费,1-允许万能卡消费
	var is_make_wnk = 1;
	//消费赠送比例
	var num_donation_ratio = 0;
	//商户选择的商品分类ID
	var choose_type_id = -1;

	mui.ready(function() {
		storage = window.localStorage;
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});

		var self = plus.webview.currentWebview();
		//获得参数 商品分类
		choose_type_id = self.type_id;

		//获取所有规格名称
		getAllGuiGeName();

		selectWnkTypeState();

		//获取所有分类
		getAllType();

		// 绑定图片选择事件
		document.getElementById("choosePhoto").addEventListener('tap', function() {
			//			document.getElementById("header_file").click();
			if(currentPhotoIndex >= 9) {
				mui.toast('最多设置10张商品图片');
				return;
			}
			if(mui.os.plus) {
				var a = [{
					title: "拍照"
				}, {
					title: "从手机相册选择"
				}];
				plus.nativeUI.actionSheet({
					title: "请选择",
					cancel: "取消",
					buttons: a
				}, function(b) { /*actionSheet 按钮点击事件*/
					switch(b.index) {
						case 0:
							break;
						case 1:
							getImage(344, 344); /*拍照*/
							break;
						case 2:
							galleryImg(344, 344); /*打开相册*/
							break;
					}
				})
			}
		});

		// input上传文件选择文件后执行事件
		document.getElementById("header_file").addEventListener('change', function() {
			chooseHeaderChangeFile();
		});

		// 绑定保存事件
		document.getElementById('addCommodity').addEventListener('tap', addCommodity);

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getAllType();
		});

		//		initGoodsTagInfo();

		// 添加规格点击事件
		document.getElementById('addGuige').addEventListener('tap', function() {
			recording++;
			var html = '' +
				'<div id="guige_div_' + recording + '">' +
				'<div class="guige">' +
				'<div class="weui-cells__title">规格</div>' +
				'	<div class="weui-cells weui-cells_form">' +
				'		<div class="weui-cell">' +
				'			<div class="weui-cell__hd">' +
				'				<label class="weui-label">规格名称</label>' +
				'			</div>' +
				'			<div class="weui-cell__bd">' +
				'				<input class="weui-input" type="text" placeholder="请输入规格名" id="guige_name_' + recording +
				'"   data-recording="' + recording + '">' +
				'			</div>' +
				'		</div>' +
				'		<ul class="guige_select" id="guige_name_ul_' + recording + '">' +
				'		</ul>' +
				'		<div class="weui-cell">' +
				'			<div class="weui-cell__hd">' +
				'				<label class="weui-label">规格价格</label>' +
				'			</div>' +
				'			<div class="weui-cell__bd">' +
				'				<input class="weui-input" type="number" placeholder="请输入规格价格" id="guige_price_' + recording +
				'"  data-recording="' + recording + '">' +
				'			</div>' +
				'		</div>' +
				'		<div class="weui-cell">' +
				'				<label class="weui-label">库存数量</label>' +
				'			<div class="weui-cell__hd">' +
				'			</div>' +
				'			<div class="weui-cell__bd">' +
				'				<input class="weui-input " type="text" placeholder="请输入库存数量" id="guige_Inventory_' + recording +
				'"  data-recording="' + recording + '">' +
				'			</div>' +
				'		</div>' +
				'		<div class="weui-cell weui-cell_switch">' +
				'			<div class="weui-cell__bd">库存无限制</div>' +
				'			<div class="weui-cell__ft">' +
				'			  <input class="weui-switch kucun" type="checkbox" id="guige_Infinity_' + recording +
				'"  data-recording="' + recording + '">' +
				'			</div>' +
				'		</div>' +
				'		<div class="weui-cell weui-cell_switch">' +
				'			<div class="weui-cell__bd">是否启用</div>' +
				'			<div class="weui-cell__ft">' +
				'			<input class="weui-switch"  type="checkbox" checked="checked" id="guige_state_' + recording +
				'" data-recording="' + recording + '">' +
				'			</div>' +
				'		</div>' +
				'		<div class="weui-cell weui-cell_switch" name="guige_wnk_state_div" >' +
				'			<div class="weui-cell__bd">万能卡权益</div>' +
				'			<div class="weui-cell__ft">' +
				'			<input class="weui-switch" type="checkbox" id="guige_wnk_state_' + recording + '" data-recording="' +
				recording + '">' +
				'			</div>' +
				'		</div>' +
				'		<p class="tips_guige_wnk_state" name="guige_wnk_state_tip">启用万能卡权益后,万能卡用户购买该规格将享受<span id="discount_guige_wnk_state_' + recording + '">9.9元</span>特权</p>' +
				'		<div class="weui-cell weui-cell_access open-popup" id="donation_ratio_state_div_' + recording + '" onclick="showDonationPop(' + recording + ')">' +
				'			<div class="weui-cell__hd cell_adjust">消费赠送比例</div>' +
				'			<div class="weui-cell__bd" style="text-align: end;" id="num_donation_ratio_' + recording + '">5%</div>' +
				'			<div class="weui-cell__ft"></div>' +
				'		</div>' +
				'		<p class="tips_guige_wnk_state" id="donation_ratio_state_tip_' + recording + '">用户购买该规格并使用后,额外赠送<span id="gift_donation_ratio_' + recording + '">0</span>现金券</p>' +
				'		<div class="weui-cell weui-cell__bd">' +
				'			<button class="weui-btn weui-btn_plain-primary" onclick="deleteGuiGe(' + recording + ',1)" style="height: 2rem;line-height: 2rem;padding: 0;">删除</button>' +
				'		</div>' +
				'	</div></div><br></div>';

			$('#addGuige').before(html);
			//填充规格名称内容
			updateGuigeName('guige_name_ul_' + recording, 'guige_name_' + recording);
			// 添加类名 用于获取并上传
			updateWnkTypeStateLocal();
			// 绑定无限制开关点击事件
			guigeInventoryStateChange();
			//价格变化动态计算额外赠送的现金券
			getGiftCashNumByPrice(recording);
			//规格万能卡权益开关事件
			guigeWnkSwitch(recording);

		});

		// 上传文件成功返回回调函数
		window.addEventListener('uploadImg', function(event) {
			var data = event.detail;
			console.log(JSON.stringify(data));
			currentPhotoIndex++;
			var html = '' +
				'<li id="photo_' + currentPhotoIndex + '" class="weui-uploader__file">' +
				'	<img src="' + data.src + '" class="phots" data-img="' + data.title + '"/>' +
				'	<span class="mui-badge mui-badge-red myBadgeposition" name="' + currentPhotoIndex + '">x</span>' +
				'</li>';
			$("#lunbo_photo_ul").append(html);
		})

		// 点击图片后查看大图
		mui('#lunbo_photo_ul').on('tap', 'li > img', function() {
			plus.nativeUI.previewImage([this.getAttribute('src')], {
				indicator: 'none'
			});
		});

		// 删除图片
		mui('#lunbo_photo_ul').on('tap', 'li > .myBadgeposition', function() {
			deletePhotoLi(this.getAttribute('name'));
		});

		//绑定规格名称点击事件(点击后填写)
		mui('.guige_select').on('tap', 'li', function() {
			var name_li = this.innerHTML;
			$('#guige_name_1').val(name_li);
		});

		//绑定消费赠送比例pop弹窗点击事件
		var content_selected = '5%';
		$('#pop_grids').on('click', 'a', function() {
			content_selected = $(this).children('p').text();
			console.log("------------");
			$(this).siblings().children('p').removeClass('grid_item_ratio_selected');
			$(this).children('p').addClass('grid_item_ratio_selected');
			//点击列表项直接完成操作
			console.log('当前项：' + item_donation_ratio + ";选中值：" + content_selected);
			$("#num_donation_ratio_" + item_donation_ratio + "").text(content_selected);
			//计算赠送现金券数量
			getGiftCashNumByRatio(item_donation_ratio);
			closeView();
		});

//		//pop弹窗确定按钮点击事件
//		$('#confirm_pop').click(function() {
//			console.log('当前项：' + item_donation_ratio + ";选中值：" + content_selected);
//			$("#num_donation_ratio_" + item_donation_ratio + "").text(content_selected);
//			//计算赠送现金券数量
//			getGiftCashNumByRatio(item_donation_ratio);
//		});

		guigeInventoryStateChange();
		//价格变化动态计算额外赠送的现金券
		getGiftCashNumByPrice(recording);
	});

	//删除轮播图li标签
	function deletePhotoLi(index) {
		$("#photo_" + index).remove();
	}

	//根据商家万能卡权益开通状况决定显示/隐藏
	function updateWnkTypeStateLocal() {
		console.log('商家是否执行了万能卡权益：' + wnk_type_state);
		//万能卡权益
		var divs = document.getElementsByName('guige_wnk_state_div');
		var guige_wnk_state_tip = document.getElementsByName('guige_wnk_state_tip');

		if(wnk_type_state == 0) {
			//未开通
			for(var index = 0; index < divs.length; index++) {
				divs[index].className += ' hide_wnk';
				guige_wnk_state_tip[index].style.display = 'none';
			}
		} else if(wnk_type_state == 1) {
			//开通
			for(var index = 0; index < divs.length; index++) {
				divs[index].className += ' show_wnk';
				guige_wnk_state_tip[index].style.display = 'block';
			}

		}
	}

	/*为点击“添加规格”按钮后的'规格名称'填充内容
	 * @param 
	 * id_guige_name_ul:动态添加的规格名称ul标签id
	 * id_guige_name_input:动态添加的规格名称输入框		
	 * */
	function updateGuigeName(id_guige_name_ul, id_guige_name_input) {
		for(var i = 0; i < allGuigeName.length; i++) {
			var html = '<li>' + allGuigeName[i] + '</li>'
			$("#" + id_guige_name_ul + "").append(html);
		}
		//规格名称点击事件
		mui("#" + id_guige_name_ul + "").on('tap', 'li', function() {
			var name_li = this.innerHTML;
			$("#" + id_guige_name_input + "").val(name_li);
		});
	}

	//获取所有规格名称
	function getAllGuiGeName() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessTypeQuickInputByBusinessId",
			type: "POST",
			dataType: 'json',
			data: {
				"businessId": storage["business_id"],
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					//规格名称填充数据
					var list = data.data;
					for(var i = 0; i < list.length; i++) {
						var obj = list[i];
						//将规格名称保存进数组
						allGuigeName.push(obj.name);
						var html = '<li>' + obj.name + '</li>';
						$('#guige_select').append(html);
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					//					mui.toast(data.msg);
				}
			},
		});
	}

	//商家是否执行了万能卡权益
	function selectWnkTypeState() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/selectWnkTypeState",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					wnk_type_state = data.data.make_wnk_state;
					if(data.data.discount_type == 0) {
						wnk_type_discount_str = data.data.commodifty_price + '元';
					} else {
						wnk_type_discount_str = (data.data.commodifty_price / 10) + '折';
					}
					getGiftCashNumByPrice(1);
					updateWnkTypeStateLocal();
					guigeWnkSwitch(1);
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	// 绑定规格中库存无限制点击事件
	function guigeInventoryStateChange() {
		mui('.weui-cell__ft').off('change', '.kucun');
		// 绑定规格无限开关打开规格数量显示
		mui('.weui-cell__ft').on('change', '.kucun', function() {
			var kucun_input_text = document.getElementById('guige_Inventory_' + this.getAttribute('data-recording'));
			console.log();
			if(this.checked) {
				kucun_input_text.value = '';
				//placeholder 
				kucun_input_text.placeholder = '无限制';
				kucun_input_text.readOnly = true;
			} else {
				kucun_input_text.value = '';
				kucun_input_text.placeholder = '请输入库存数量';
				kucun_input_text.readOnly = true;
			}
		})
	}

	/*规格价格变化动态计算额外赠送的现金券
	 *参数：当前规格是第几项
	 */
	function getGiftCashNumByPrice(recording) {
		//		document.getElementById("discount_guige_wnk_state_" + recording).innerHTML = wnk_type_discount_str;
		//		$("#guige_price_" + recording).bind('input propertychange', function() {
		//			var price = $(this).val();
		//			if(price != undefined && price != '') {
		//				input_price = price;
		//			} else {
		//				input_price = 0;
		//			} 
		//			//如果商家未开启万能卡权益(赠送比例显示)
		//			var num_donation_ratio = document.getElementById("num_donation_ratio_" + recording).innerHTML;
		//			//去掉%号
		//			num_donation_ratio = num_donation_ratio.substring(0, num_donation_ratio.length - 1);
		//			//计算赠送的现金券(保留两位小数)
		//			var num_xjq = Math.round(input_price * num_donation_ratio / 100 * 100) / 100;
		//			console.log('recording:' + recording + ';输入的价格：' + input_price + ";比例：" + num_donation_ratio + ";现金券：" + num_xjq);
		//			document.getElementById("gift_donation_ratio_" + recording + "").innerHTML = num_xjq;
		//		});
		document.getElementById("discount_guige_wnk_state_" + recording).innerHTML = wnk_type_discount_str;
		document.getElementById('guige_price_' + recording).addEventListener('input', function() {
			var price = $(this).val();
			console.log(price);
			if(price != undefined && price != '') {
				input_price = price;
			} else {
				input_price = 0;
			}
			//如果商家未开启万能卡权益(赠送比例显示)
			var num_donation_ratio = document.getElementById("num_donation_ratio_" + recording).innerHTML;
			//去掉%号
			num_donation_ratio = num_donation_ratio.substring(0, num_donation_ratio.length - 1);
			//计算赠送的现金券(保留两位小数)
			var num_xjq = Math.round(input_price * num_donation_ratio / 100 * 100) / 100;
			console.log('recording:' + recording + ';输入的价格：' + input_price + ";比例：" + num_donation_ratio + ";现金券：" + num_xjq);
			document.getElementById("gift_donation_ratio_" + recording + "").innerHTML = num_xjq;
		}, false);
	}
	/*赠送比例变化动态计算赠送的现金券
	 *参数：当前规格是第几项
	 */
	function getGiftCashNumByRatio(recording) {
		var price = $("#guige_price_" + recording + "").val();
		if(price != '' && price != undefined) {
			input_price = price;
		} else {
			input_price = 0;
		}
		//如果商家未开启万能卡权益(赠送比例显示)
		var num_donation_ratio = document.getElementById("num_donation_ratio_" + recording).innerHTML;
		//去掉%号
		num_donation_ratio = num_donation_ratio.substring(0, num_donation_ratio.length - 1);
		//计算赠送的现金券(保留两位小数)
		var num_xjq = Math.round(input_price * num_donation_ratio / 100 * 100) / 100;
		console.log('recording:' + recording + ';输入的价格：' + input_price + ";比例：" + num_donation_ratio + ";现金券：" + num_xjq);
		document.getElementById("gift_donation_ratio_" + recording + "").innerHTML = num_xjq;
	}

	//判断字符串是否为数字
	function checkRate(nubmer) {
		//判断正整数
		var re = /^\d+$/;
		if(re.test(nubmer)) {
			return true;
		} else {
			return false;
		}
	}

	//获取分类
	function getAllType() {
		toast(2, "打开loading");
		$("#type_ul li").remove();
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
						var typeSelect = document.getElementById("type_select");
						for(var index = 0; index < list.length; index++) {
							isHaveCommodityType = 0;
							var obj = list[index];
							typeSelect.options.add(new Option(obj.type_name, obj.id)); //这个兼容IE与firefox
						}
						if(choose_type_id != -1) {
							$("#type_select").val(choose_type_id);
						}
					}
				} else if(data.msg == 1) {
					mMain.gotoLogin('../login.html');
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	// input文件上传
	function chooseHeaderChangeFile() {
		toast(2, "开启loading");
		jQuery.support.cors = true;
		$.ajaxFileUpload({
			url: mMain.url + '/images/savaimageMobile.do', // 用于文件上传的服务器端请求地址
			secureuri: false, // 是否需要安全协议，一般设置为false
			fileElementId: 'header_file', // 文件上传域的ID
			dataType: 'json', // 返回值类型 一般设置为json
			type: "post",
			data: {
				"fileNameStr": "ajaxFile",
				"fileId": "header_file"
			},
			success: function(data, status) // 服务器成功响应处理函数
			{
				toast(3, "关闭loading");
				if(data.error == 0) {
					commodityPhotoId = data.url;
					document.getElementById("commodity_photo").src = data.url_location;
				} else {
					toast(1, data.message);
				}
			},
			error: function(data, status, e) // 服务器响应失败处理函数
			{
				toast(3, "关闭loading");
				alert(e);
			}
		});
	}

	//添加商品
	function addCommodity() {
		if(isHaveCommodityType == -1) {
			toast(0, "请先创建商品分类");
		} else {
			var name = document.getElementById("name").value;
			var price = document.getElementById("price").value;
			var type_id = document.getElementById("type_select").options[document.getElementById("type_select").selectedIndex]
				.value;
			var describe = document.getElementById("describe").value;

			var guige = document.getElementsByClassName('guige');
			for(var i = 1; i <= guige.length; i++) {
				var guige_name = document.getElementById("guige_name_" + i).value;
				var guige_price = document.getElementById("guige_price_" + i).value;
				var guige_kucun = document.getElementById('guige_Inventory_' + i).value;

				var guige_state = document.getElementById("guige_state_" + i).checked == true ? 0 : 1;
				var guige_Infinity = document.getElementById("guige_Infinity_" + i).checked == true ? 0 : 1;
				var guige_wnk_state = document.getElementById("guige_wnk_state_" + i).checked == true ? 0 : 1;

				if(guige_Infinity == 0) {
					guige_kucun = -1;
				}

				if(guige_name == undefined || guige_name == '') {
					mui.toast('有规格名称未填写');
					return;
				}
				if(guige_price == undefined || guige_price == '') {
					mui.toast('有规格价格未填写');
					return;
				}
				if(guige_kucun != -1 && guige == undefined || guige_kucun == '') {
					mui.toast('有规格库存未填写');
					return;
				}

			}

			var img_titile = '';
			var a = $('#lunbo_photo_ul > li > img ');
			for(var i = 0; i < a.length; i++) {
				console.log(JSON.stringify(a[i].getAttribute("data-img")));
				img_titile += a[i].getAttribute("data-img") + "|";
			}

			if(name == "" || name == undefined) {
				mui.toast("请输入商品名称");
			} else if(price == "" || price == undefined) {
				mui.toast("请输入商品价格");
			}
			//			else if(goods_tag == "" || goods_tag == undefined) {
			//				mui.toast("请选择商品标签");
			//			}
			else if(type_id == "" || type_id == undefined) {
				mui.toast("请先创建商品分类");
			} else if(describe == "" || describe == undefined) {
				mui.toast("请输入商品描述");
			} else if(img_titile == "" || img_titile == undefined) {
				mui.toast("请上传商品图片");
			} else if(checkRate(price) == false) {
				mui.toast("商品价格需为整数");
			} else {
				console.log(1);
				toast(2, "打开loading");
				console.log('price:' + price);
				jQuery.support.cors = true;
				$.ajax({
					url: mMain.url + "/wnk_business_app/v1.0.0/addCommodity",
					type: "POST",
					dataType: 'json',
					data: {
						"business_id": storage["business_id"],
						"name": name,
						"price": price,
						"type_id": type_id,
						"describe": describe,
						"commodityPhotoId": img_titile.substring(0, img_titile.length - 1),
						"state": commodityState,
						"is_make_wnk": is_make_wnk,
						'goods_tag': "",
					},
					success: function(data) {
						toast(3, "关闭loading");
						if(data.status == 0) {
							// 先插入规格	
							for(var i = 1; i <= guige.length; i++) {
								var guige_id = document.getElementById("guige_name_" + i).getAttribute('data-id');
								var guige_name = document.getElementById("guige_name_" + i).value;
								var guige_price = document.getElementById("guige_price_" + i).value;
								var guige_kucun = document.getElementById('guige_Inventory_' + i).value;
								var guige_state = document.getElementById("guige_state_" + i).checked == true ? 0 : 1;
								var guige_Infinity = document.getElementById("guige_Infinity_" + i).checked == true ? 0 : 1;
								var guige_wnk_state = document.getElementById("guige_wnk_state_" + i).checked == true ? 0 : 1;

								if(guige_Infinity == 0) {
									guige_kucun = -1;
								}

								if(guige_wnk_state == 0) {
									//开启规格万能卡权益
									num_donation_ratio = 0;
								} else {
									//未开启规格万能卡权益
									var num_donation_ratio = document.getElementById("num_donation_ratio_" + i).innerHTML;
									//去掉%号
									num_donation_ratio = num_donation_ratio.substring(0, num_donation_ratio.length - 1);
								}

								//上传商品规格参数
								updateAndInsertGuige(guige_id, guige_name, guige_price, guige_state, data.data, guige_kucun,
									guige_wnk_state, num_donation_ratio);
							}
							mui.toast('商品添加成功');
							joinGoodsTagChoose(data.data);
							//							mui.alert('添加成功', '猛戳商家版', function() {
							//								mMain.back();
							//							});
						} else if(data.msg == 1) {
							mMain.gotoLogin('../login.html');
						} else {
							mui.toast(data.msg);
						}
					},
				});
			}
		}
	}

	//进入商品标签选择页面
	function joinGoodsTagChoose(commodity_id) {
		mui.openWindow({
			url: '/web/add_goods/choose_goods_tag.html',
			id: 'choose_goods_tag.html',
			styles: {
				top: '0px',
				bottom: '51px',
			},
			extras: {
				"commodity_id": commodity_id
			},
			createNew: true
		});
	}

	//拍照 
	function getImage(w, h) {
		plus.camera.getCamera().captureImage(function(p) {

			plus.io.resolveLocalFileSystemURL(p, function(entry) {
				console.log(entry.toLocalURL());
				mui.openWindow({
					url: '/web/common/cropper.html',
					id: 'cropper.html',
					styles: {
						top: '0px',
						bottom: '51px',
					},
					createNew: true,
					show: {
						aniShow: 'none', //页面显示动画，默认为”slide-in-right“；
					},
					waiting: {
						autoShow: false, //自动显示等待框，默认为true
					},
					extras: {
						winth: w,
						height: h,
						path: entry.toLocalURL()
					},
				});
			});
		});
	}
	//本地相册选择 
	function galleryImg(w, h) {
		plus.gallery.pick(function(p) {
			//			uploadHead(p);
			mui.openWindow({
				url: '/web/common/cropper.html',
				id: 'cropper.html',
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
				},
				extras: {
					winth: w,
					height: h,
					path: p
				},
			});
		})
	};

	//上传图片 
	function uploadHead(imgPath) {
		toast(2, "打开loding")
		var task = plus.uploader.createUpload(mMain.url + '/images/saveImageLayUi', {
			method: "post"
		}, completedCB);
		task.addFile(imgPath, {
			key: 'file'
		});
		task.start();
	}
	// 上传图片成功回调函数
	function completedCB(t, status) {
		if(status == 200) {
			var data = JSON.parse(t.responseText);
			commodityPhotoId = data.data.title;
			document.getElementById("commodity_photo").src = data.data.src;
			toast(3, "关闭lodding")
		} else {
			console.log("上传失败：" + JSON.stringify(t));
			mui.toast("图片上传失败");
			toast(3, "关闭lodding")
		}
	}

	/**
	 * 添加过更新规格
	 * @param {Object} guige_name
	 * @param {Object} guige_price
	 * @param {Object} guige_status
	 */
	function updateAndInsertGuige(guige_id, guige_name, guige_price, guige_status, commodity_id, guige_kucun,
		guige_wnk_state, num_donation_ratio) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		console.log('万能卡权益：' + guige_wnk_state + '库存无限：' + guige_status);
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/updateAndInsertGuige",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage['business_id'],
				"commodity_id": commodity_id,
				"id": guige_id,
				"specifications_name": guige_name,
				"price": guige_price,
				"state": guige_status,
				'inventory': guige_kucun,
				'is_wnk': guige_wnk_state,
				'gift_noun': num_donation_ratio
			},
			success: function(data) {
				toast(3, "关闭loading");
				console.log(JSON.stringify(data));
				if(data.status == 0) {

				} else if(data.msg == 1) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

});

function Switch(a) {
	a.innerHTML = a.innerHTML == '启用' ? '禁用' : '启用'
}

function Switch_wnk(a) {
	a.innerHTML = a.innerHTML == '启用万能卡' ? '禁用万能卡' : '启用万能卡'
}

function deleteGuiGe(id, y) {
	mui.confirm('是否删除该规格？', '猛戳商家版', ['取消', '确定'], function(e) {
		if(e.index == 0) {

		} else {
			$('#guige_div_' + id).empty();
		}
	});
}

//消费积分赠送点击弹窗
function showDonationPop(index) {
	console.log("***********" + index);
	popupState.popup_state = true;
	item_donation_ratio = index;
	$('#half').popup('');
}

function closeView() {
	if(popupState.popup_state == true) {
		console.log('关闭*****');
		$.closePopup();
		popupState.popup_state = false;
	}
}

//规格万能卡权益开关点击事件
function guigeWnkSwitch(i) {
	document.getElementById("guige_wnk_state_" + i).addEventListener('change', function() {
		var guige_wnk_state = document.getElementById("guige_wnk_state_" + i).checked == true ? 0 : 1;
		console.log("*******" + guige_wnk_state);
		//消费赠送比例 
		var donation_ratio_state_tip = document.getElementById('donation_ratio_state_tip_' + i);
		//商品规格是否执行了万能卡权益(规格执行了万能卡权益则隐藏消费赠送)
		if(guige_wnk_state == 0) {
			//规格执行了万能卡权益
			$("#donation_ratio_state_div_" + i).removeClass('show_wnk');
			$("#donation_ratio_state_div_" + i).addClass('hide_wnk');
			donation_ratio_state_tip.style.display = 'none';
			num_donation_ratio = 0;
		} else if(guige_wnk_state == 1) {
			//规格未执行万能卡权益
			$("#donation_ratio_state_div_" + i).removeClass('hide_wnk');
			$("#donation_ratio_state_div_" + i).addClass('show_wnk');
			donation_ratio_state_tip.style.display = 'block';
		}
	});
}