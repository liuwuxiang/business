var storage = null;

var popupState = {
	//弹窗状态(false-未打开,1-已打开)
	popup_state: false,
}
// 规格记录ID
var recording = 1;

// 是否执行万能卡
var wnk_type_state = -1;
// 折扣方式
var wnk_type_discount_str = '';

var currentPhotoIndex = -1;

//记录是哪个商品规格的消费赠送比例
var item_donation_ratio = '';

//数组保存规格名称(用以添加新的规格)
var allGuigeName = new Array();

mui.init({
	swipeBack: true, //启用右滑关闭功能
});
mui.plusReady(function() {
	//商品图片id
	var commodityPhotoId = "";
	//0-上架,1-下架
	var commodityState = 0;
	//商品id
	var commodity_id = -1;
	//商品分类id
	var commodity_type_id = -1;
	//0-不允许万能卡消费,1-允许万能卡消费
	var is_make_wnk = 1;

	mui.ready(function() {
		storage = window.localStorage;
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});

		selectWnkTypeState();

		mui('.mui_switch_line').each(function() { //循环所有toggle
			// toggle 事件监听
			this.addEventListener('toggle', function(event) {
				document.getElementById("line_commodity_state").innerHTML = event.detail.isActive ? "(上架)" : "(下架)";
				commodityState = event.detail.isActive ? 0 : 1;
			});
		});

		var self = plus.webview.currentWebview();
		commodity_id = self.commodity_id; //获得参数
		//获取可选的规格名称内容
		getAllGuiGeName();
		//获取商品详情
		getCommodityDetail();

		// 事件绑定
		document.getElementById('setCommodity').addEventListener('tap', setCommodity);

		document.getElementById('choosePhoto').addEventListener('tap', function() {
			//			document.getElementById("header_file").click();
			console.log(currentPhotoIndex);
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
		document.getElementById('header_file').addEventListener('change', chooseHeaderChangeFile);

		// 添加规格点击事件
		document.getElementById('addGuige').addEventListener('tap', function() {
			recording++;
			var html = '' +
				'<div id="guige_div_' + recording + '">' +
				'<div class="guige" guige-id="' + recording + '">' +
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
				'		<div class="weui-cell weui-cell_switch" name="guige_wnk_state_div"  >' +
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
				'			<button class="weui-btn weui-btn_plain-primary" onclick="deleteGuiGe(' + recording +
				',1)" style="height: 2rem;line-height: 2rem;padding: 0;">删除</button>' +
				'		</div>' +
				'	</div></div></div><br>';
			$('#addGuige').before(html);

			updateWnkTypeStateLocal();

			guigeInventoryStateChange();
			//填充所有的规格名称可选内容
			updateGuigeName('guige_name_ul_' + recording, 'guige_name_' + recording);
			//价格变化动态计算额外赠送的现金券
			getGiftCashNumByPrice(recording);
			//规格万能卡权益开关事件
			guigeWnkSwitch(recording);
		});

		// 初始化商品标签
		initGoodsTagInfo();

		mui('#lunbo_photo_ul').on('tap', 'li > img', function() {
			plus.nativeUI.previewImage([this.getAttribute('src')], {
				indicator: 'none'
			});
		});

		mui('#lunbo_photo_ul').on('tap', 'li > .myBadgeposition', function() {
			deletePhotoLi(this.getAttribute('name'));
		});

		//绑定消费赠送比例pop弹窗点击事件
		var content_selected = '5%';
		$('#pop_grids').on('click', 'a', function() {
			content_selected = $(this).children('p').text();
			console.log("------------");
			$(this).siblings().children('p').removeClass('grid_item_ratio_selected');
			$(this).children('p').addClass('grid_item_ratio_selected');

		});
		//pop弹窗确定按钮点击事件
		$('#confirm_pop').click(function() {
			console.log('当前项：' + item_donation_ratio + ";选中值：" + content_selected);
			$("#num_donation_ratio_" + item_donation_ratio + "").text(content_selected);
			//计算赠送现金券数量
			getGiftCashNumByRatio(item_donation_ratio);
		});

		window.addEventListener('uploadImg', function(event) {
			var data = event.detail;
			console.log(JSON.stringify(data));
			commodityPhotoId += data.title + '|';
			//document.getElementById("commodity_photo").src = data.src;
			currentPhotoIndex++;
			var html = '' +
				'<li id="photo_' + currentPhotoIndex + '" class="weui-uploader__file">' +
				'	<img src="' + data.src + '" class="phots" data-img="' + data.title + '"/>' +
				'	<span class="mui-badge mui-badge-red myBadgeposition" name="' + currentPhotoIndex + '">x</span>' +
				'</li>';

			$("#lunbo_photo_ul").append(html);

		});

	});

	//删除轮播图li标签
	function deletePhotoLi(index) {
		$("#photo_" + index).remove();
	}

	//根据万能卡权益开通状况决定显示/隐藏
	function updateWnkTypeStateLocal() {
		console.log('商家是否执行了万能卡权益：' + wnk_type_state);
		//万能卡权益
		var divs = document.getElementsByName('guige_wnk_state_div');
		//消费赠送比例
		var donation_ratio_state_div = document.getElementsByName('donation_ratio_state_div');
		//提示
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
					console.log(JSON.stringify(data));
					if(data.data.discount_type == 0) {
						wnk_type_discount_str = data.data.commodifty_price + '元';
					} else {
						wnk_type_discount_str = (data.data.commodifty_price / 10) + '折';
					}
					updateWnkTypeStateLocal();
					getGiftCashNumByPrice(1);
					guigeWnkSwitch(1);
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

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
				toast(3, "关闭loading");
				if(data.status == 0) {
					if(data.data != undefined || data.data != null && data.data.length > 0) {
						var dataArr = [];
						for(var i = 0; i < data.data.length; i++) {
							dataArr.push({
								title: data.data[i].name,
								value: data.data[i].name
							});
						}
						/*
						$('#goods_tag').select({
							title: "商品标签",
							multi: true,
							items: dataArr,
							onChange: function(d) {
								$("input[name=goods_tag]").val(d.values);
								$('#goods_tag').val(d.titles);
							}
						});
						*/

						$('#goods_tag').select({
							title: "商品标签",
							multi: true,
							items: dataArr,
							onChange: function(d) {
								$("input[name=goods_tag]").val(d.values);
								$('#goods_tag').val(d.titles);
							}
						});

					} else {
						mui.toast('请先添加商品标签');
					}

				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	/*规格价格变化动态计算额外赠送的现金券
	 *参数：当前规格是第几项
	 */
	function getGiftCashNumByPrice(recording) {
		//		document.getElementById("discount_guige_wnk_state_" + recording).innerHTML = wnk_type_discount_str;
		//		$("#guige_price_" + recording + "").bind('input propertychange', function() {
		//			var price = $(this).val();
		//			if(price != '' && price != undefined) {
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
							var obj = list[index];
							var option = new Option(obj.type_name, obj.id);
							if(obj.id == commodity_type_id) {
								option.selected = true;
							}
							typeSelect.options.add(option); //这个兼容IE与firefox
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

	//获取商品详情
	function getCommodityDetail() {
		toast(2, "打开loading");
		$("#type_ul li").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getCommodityDetail",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"commodity_id": commodity_id
			},
			success: function(data) {
				toast(3, "关闭loading");
				if(data.status == 0) {
					console.log();
					document.getElementById("name").value = data.data.name;
					document.getElementById("price").value = data.data.price;
					commodity_type_id = data.data.type_id;
					document.getElementById("describe").value = data.data.commodity_describe;
					commodityState = data.data.state;
					//					is_make_wnk = data.data.is_make_wnk;

					document.getElementsByName('goods_tag')[0].value = data.data.goods_tag;
					// initLabelValue(2, data.data.area);
					document.getElementById('goods_tag').setAttribute('value', data.data.goods_tag);
					document.getElementById('goods_tag').setAttribute('data-value', data.data.goods_tag);

					var guige = data.data.goods_guige;
					console.log("++++++++++++++++" + JSON.stringify(guige));
					if(guige != undefined && guige.length > 0) {
						var guige_div = document.getElementsByClassName('guige');
						guige_div[0].remove();
						for(var i = 1; i <= guige.length; i++) {

							var state = guige[i - 1].state == 0 ? '启用' : '禁用';
							var html = '' +
								'<div id="guige_div_' + guige[i - 1].id + '">' +
								'<div class="guige" guige-id="' + guige[i - 1].id + '">' +
								'<div class="weui-cells__title">规格' + i + '</div>' +
								'	<div class="weui-cells weui-cells_form">' +
								'		<div class="weui-cell">' +
								'			<div class="weui-cell__hd">' +
								'				<label class="weui-label">规格名称</label>' +
								'			</div>' +
								'			<div class="weui-cell__bd">' +
								'				<input class="weui-input" type="text" placeholder="请输入规格名" id="guige_name_' + guige[i - 1].id + '"   data-id="' +
								guige[i - 1].id + '" data-recording="' + i + '" value="' + guige[i - 1].specifications_name + '">' +
								'			</div>' +
								'		</div>' +
								'		<ul class="guige_select" id="guige_name_ul_' + guige[i - 1].id + '">' +
								'		</ul>' +

								'		<div class="weui-cell">' +
								'			<div class="weui-cell__hd">' +
								'				<label class="weui-label">规格价格</label>' +
								'			</div>' +
								'			<div class="weui-cell__bd">' +
								'				<input class="weui-input" type="number" placeholder="请输入规格价格" id="guige_price_' + guige[i - 1].id + '"  value="' +
								guige[i - 1].price + '"  data-id="' + guige[i - 1].id + '" data-recording="' + i + '" >' +
								'			</div>' +
								'		</div>' +
								'		<div class="weui-cell">' +
								'				<label class="weui-label">库存数量</label>' +
								'			<div class="weui-cell__hd">' +
								'			</div>' +
								'			<div class="weui-cell__bd">' +
								'				<input class="weui-input " type="text" placeholder="请输入库存数量" id="guige_Inventory_' + guige[i - 1].id + '"  value="' +
								guige[i - 1].inventory + '"  data-id="' + guige[i - 1].id + '" data-recording="' + i + '" >' +
								'			</div>' +
								'		</div>' +
								'		<div class="weui-cell weui-cell_switch">' +
								'			<div class="weui-cell__bd">库存无限制</div>' +
								'			<div class="weui-cell__ft">' +
								'			  <input class="weui-switch kucun" type="checkbox" id="guige_Infinity_' + guige[i - 1].id + '"  data-recording="' +
								i + '">' +
								'			</div>' +
								'		</div>' +
								'		<div class="weui-cell weui-cell_switch">' +
								'			<div class="weui-cell__bd">是否启用</div>' +
								'			<div class="weui-cell__ft">' +
								'			<input class="weui-switch"  type="checkbox" id="guige_state_' + guige[i - 1].id + '" data-recording="' + i + '">' +
								'			</div>' +
								'		</div>' +
								'		<div class="weui-cell weui-cell_switch" name="guige_wnk_state_div">' +
								'			<div class="weui-cell__bd">万能卡权益</div>' +
								'			<div class="weui-cell__ft">' +
								'			<input class="weui-switch" type="checkbox" id="guige_wnk_state_' + guige[i - 1].id + '" data-recording="' + i + '">' +
								'			</div>' +
								'		</div>' +
								'		<p class="tips_guige_wnk_state" name="guige_wnk_state_tip">启用万能卡权益后,万能卡用户购买该规格将享受<span id="discount_guige_wnk_state_' + guige[i - 1].id + '">9.9元</span>特权</p>' +
								'		<div class="weui-cell weui-cell_access open-popup" id="donation_ratio_state_div_' + guige[i - 1].id + '" onclick="showDonationPop(' + guige[i - 1].id + ')">' +
								'			<div class="weui-cell__hd cell_adjust">消费赠送比例</div>' +
								'			<div class="weui-cell__bd" style="text-align: end;" id="num_donation_ratio_' + guige[i - 1].id + '">' + guige[i - 1].gift_noun + '%</div>' +
								'			<div class="weui-cell__ft"></div>' +
								'		</div>' +
								'		<p class="tips_guige_wnk_state" id="donation_ratio_state_tip_' + guige[i - 1].id + '">用户购买该规格并使用后,额外赠送<span id="gift_donation_ratio_' + guige[i - 1].id + '">0</span>现金券</p>' +
								'		<div class="weui-cell weui-cell__bd">' +
								'			<button class="weui-btn weui-btn_plain-primary" onclick="deleteGuiGe(' + guige[i - 1].id + ')" style="height: 2rem;line-height: 2rem;padding: 0;">删除</button>' +
								'		</div>' +
								'	</div></div></div><br>';
							$('#addGuige').before(html);
							recording = guige[i - 1].id;
							updateWnkTypeStateLocal();
							//填充所有规格名称
							updateGuigeName('guige_name_ul_' + guige[i - 1].id, 'guige_name_' + guige[i - 1].id);
							//价格变化动态计算额外赠送的现金券
							getGiftCashNumByPrice(guige[i - 1].id);
							//规格万能卡权益开关事件
							guigeWnkSwitch(guige[i - 1].id);

							if(guige[i - 1].inventory == undefined || guige[i - 1].inventory == '' || guige[i - 1].inventory == null) {
								document.getElementById('guige_Inventory_' + guige[i - 1].id).value = '0';
							}
							//消费赠送比例 
							var donation_ratio_state_tip = document.getElementById('donation_ratio_state_tip_' + guige[i - 1].id);
							if(guige[i - 1].is_wnk == 0) {
								//规格启用了万能卡权益
								document.getElementById('guige_wnk_state_' + guige[i - 1].id).checked = true;
								$("#donation_ratio_state_div_" + guige[i - 1].id).removeClass('show_wnk');
								$("#donation_ratio_state_div_" + guige[i - 1].id).addClass('hide_wnk');
								donation_ratio_state_tip.style.display = 'none';
							} else {
								//规格未执行万能卡权益
								$("#donation_ratio_state_div_" + guige[i - 1].id).removeClass('hide_wnk');
								$("#donation_ratio_state_div_" + guige[i - 1].id).addClass('show_wnk');
								donation_ratio_state_tip.style.display = 'block';
							}

							if(guige[i - 1].state == 0) {
								document.getElementById('guige_state_' + guige[i - 1].id).checked = true;
							}

							if(guige[i - 1].inventory == -1) {
								document.getElementById('guige_Infinity_' + guige[i - 1].id).checked = true;
								document.getElementById('guige_Inventory_' + guige[i - 1].id).value = '';
								document.getElementById('guige_Inventory_' + guige[i - 1].id).placeholder = '无限制';
								document.getElementById('guige_Inventory_' + guige[i - 1].id).readOnly = '无限制';
							}

							recording = guige[i - 1].id;
						}

					}

					guigeInventoryStateChange();

					if(commodityState == 0) {
						document.getElementById("line_commodity_state").innerText = "(上架)";
						document.getElementById("commodity_state_switch").setAttribute("class",
							"mui-switch mui-active is_line_switch mui_switch_line");
					} else {
						document.getElementById("line_commodity_state").innerText = "(下架)";
						document.getElementById("commodity_state_switch").setAttribute("class",
							"mui-switch is_line_switch mui_switch_line");
					}
					//					if(is_make_wnk == 0) {
					//						document.getElementById("is_make_wnk").innerText = "(不允许)";
					//						document.getElementById("is_make_wnk_switch").setAttribute("class", "mui-switch is_line_switch mui_switch_wnk");
					//					} else {
					//						document.getElementById("is_make_wnk").innerText = "(允许)";
					//						document.getElementById("is_make_wnk_switch").setAttribute("class", "mui-switch mui-active is_line_switch mui_switch_wnk");
					//					}
					// commodityPhotoId = data.data.photo_id;
					// document.getElementById("commodity_photo").src = data.data.local_photo;
					// 					
					var photoArr = data.data.local_photo.split("|");

					for(var i = 0; i < photoArr.length; i++) {
						var html = '' +
							'<li id="photo_' + i + '" class="weui-uploader__file">' +
							'	<img src="' + data.data.img_path + photoArr[i] + '" class="phots" data-img="' + photoArr[i] + '"/>' +
							'	<span class="mui-badge mui-badge-red myBadgeposition" name="' + i + '">x</span>' +
							'</li>';
						$("#lunbo_photo_ul").append(html);
					}

					//获取分类
					getAllType();
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	/*获取所有规格名称
	 *@param:
	 * id_guige_name_ul:规格名称选择ul标签id
	 * id_guige_name_input:规格名称输入框id
	 */
	function getAllGuiGeName() {
		//		//模拟数据
		//		for(var i = 0; i < 6; i++) {
		//			//将规格名称保存进数组
		//			allGuigeName.push('麻辣香锅'+i);
		//			var html = '<li>' + allGuigeName[i] + '</li>';
		//			$('#guige_select').append(html);
		//		}

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
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					//					mui.toast(data.msg);
				}
			},
		});
	}

	/*为点击“添加规格”按钮后的'规格名称'填充内容
	 * @param 
	 * id_guige_name_ul:动态添加的规格名称ul标签id
	 * id_guige_name_input:动态添加的规格名称输入框		
	 * */
	function updateGuigeName(id_guige_name_ul, id_guige_name_input) {
		//清空 
		$("#" + id_guige_name_ul + " li").remove();
		for(var i = 0; i < allGuigeName.length; i++) {
			var html = '<li>' + allGuigeName[i] + '</li>'
			$("#" + id_guige_name_ul + "").append(html);
		}
		//规格名称点击事件
		mui("#" + id_guige_name_ul + "").on('tap', 'li', function() {
			var name_select = this.innerHTML;
			$("#" + id_guige_name_input + "").val(name_select);
		});
	}

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
				kucun_input_text.readOnly = false;
			}
		})
	}

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
			}
		});
	}

	//修改商品
	function setCommodity() {
		var name = document.getElementById("name").value;
		var price = document.getElementById("price").value;
		var type_id = document.getElementById("type_select").options[document.getElementById("type_select").selectedIndex].value;
		var describe = document.getElementById("describe").value;

		var goods_tag = document.getElementsByName('goods_tag')[0].value;

		var guige = document.getElementsByClassName('guige');
		for(var i = 0; i < guige.length; i++) {
			var index = guige[i].getAttribute('guige-id');
			console.log(index);
			var guige_name = document.getElementById("guige_name_" + index).value;
			var guige_price = document.getElementById("guige_price_" + index).value;
			var guige_kucun = document.getElementById('guige_Inventory_' + index).value;

			var guige_state = document.getElementById("guige_state_" + index).checked == true ? 0 : 1;
			var guige_Infinity = document.getElementById("guige_Infinity_" + index).checked == true ? 0 : 1;
			var guige_wnk_state = document.getElementById("guige_wnk_state_" + index).checked == true ? 0 : 1;

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

		// var commodityPhotoId2 = 
		var img_titile = '';
		var a = $('#lunbo_photo_ul > li > img ');
		for(var i = 0; i < a.length; i++) {
			img_titile += a[i].getAttribute("data-img") + "|";
		}
		if(name == "" || name == undefined) {
			mui.toast("请输入商品名称");
		} else if(price == "" || price == undefined) {
			mui.toast("请输入商品价格");
		} else if(type_id == "" || type_id == undefined) {
			mui.toast("请先创建商品分类");
		} else if(describe == "" || describe == undefined) {
			mui.toast("请输入商品描述");
		} else if(img_titile == "" || img_titile == undefined) {
			mui.toast("请上传商品图片");
		} else if(checkRate(price) == false) {
			mui.toast("商品价格需为整数");
		} else {
			if(goods_tag == undefined) {
				goods_tag = "";
			}
			// 先插入规格	
			for(var i = 0; i < guige.length; i++) {
				var index = guige[i].getAttribute('guige-id');
				var guige_id = document.getElementById("guige_name_" + index).getAttribute('data-id');
				var guige_name = document.getElementById("guige_name_" + index).value;
				var guige_price = document.getElementById("guige_price_" + index).value;
				var guige_kucun = document.getElementById('guige_Inventory_' + index).value;
				var guige_state = document.getElementById("guige_state_" + index).checked == true ? 0 : 1;
				var guige_Infinity = document.getElementById("guige_Infinity_" + index).checked == true ? 0 : 1;
				var guige_wnk_state = document.getElementById("guige_wnk_state_" + index).checked == true ? 0 : 1;

				if(guige_Infinity == 0) {
					guige_kucun = -1;
				}

				if(guige_wnk_state == 0) {
					//开启规格万能卡权益
					num_donation_ratio = 0;
				} else {
					//未开启规格万能卡权益
					var num_donation_ratio = document.getElementById("num_donation_ratio_" + index).innerHTML;
					//去掉%号
					num_donation_ratio = num_donation_ratio.substring(0, num_donation_ratio.length - 1);
				}
				updateAndInsertGuige(guige_id, guige_name, guige_price, guige_state, guige_kucun, guige_wnk_state, num_donation_ratio);
			}
			toast(2, "打开loading");
			console.log(commodityPhotoId);
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/setCommodityInformation",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"commodity_id": commodity_id,
					"name": name,
					"price": price,
					"type_id": type_id,
					"commodity_describe": describe,
					"photo": img_titile.substring(0, img_titile.length - 1),
					"state": commodityState,
					"is_make_wnk": is_make_wnk,
					'goods_tag': goods_tag
				},
				success: function(data) {
					toast(3, "关闭loading");
					if(data.status == 0) {
						toast(1, data.msg);
						mMain.back();
						//						joinGoodsTagChoose(commodity_id);
					} else if(data.msg == 1) {
						mMain.gotoLogin();
					} else {
						mui.toast(data.msg);
					}
				},
			});
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

	/**
	 * 添加过更新规格
	 * @param {Object} guige_name
	 * @param {Object} guige_price
	 * @param {Object} guige_status
	 */
	function updateAndInsertGuige(guige_id, guige_name, guige_price, guige_status, guige_kucun, guige_wnk_state, num_donation_ratio) {
		toast(2, "打开loading");
		jQuery.support.cors = true;
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

function deleteGuiGe(id, y) {
	mui.confirm('是否删除该规格？', '猛戳商家版', ['取消', '确定'], function(e) {
		if(e.index == 0) {
			//取消
		} else {
			if(y == undefined || y == null || y == '') {
				toast(2, "打开loading");
				jQuery.support.cors = true;
				$.ajax({
					url: mMain.url + "/wnk_business_app/v1.0.0/deleteBusinessCommodityGuiGeById",
					type: "POST",
					dataType: 'json',
					data: {
						"business_id": storage["business_id"],
						"guige_id": id,
					},
					success: function(data) {
						toast(3, "关闭loading");
						console.log(JSON.stringify(data));
						if(data.status == 0) {
							$('#guige_div_' + id).empty();
						} else {
							mui.toast(data.msg);
						}
					},
				});
			} else {
				$('#guige_div_' + id).empty();
			}
		}
	});
}

//消费积分赠送点击弹窗
function showDonationPop(index) {
	console.log("***********" + index);
	popupState.popup_state = true;
	item_donation_ratio = index;
	$('#half').popup('open');
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