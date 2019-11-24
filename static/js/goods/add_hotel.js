var storage = null;

//记录是哪个商品规格的消费赠送比例
var item_donation_ratio = '';

var recording = 1;

var wnk_type_state = -1;

var currentPhotoIndex = -1;
//数组保存规格名称(用以添加新的规格)
var allGuigeName = new Array();

//规格价格、赠送比例(用于计算额外赠送的现金券数量)
var input_price = 0;
var input_donation_ratio = 0;

//记录点击哪一项的弹窗
var currentItem = '';
//是否多选
var isMultiSelect = false;
//是否必选
var isRequiredSelect = false;
/******弹窗内容Start******/
//标题
var title_pop = '';
//提示
var tip_pop = '';
//显示input
var isShowInput = false;
//input提示
var tipInput = '';
//input类型
var typeInput = 'text';
//单位
var unit_input = '';
//内容数据
var contentData = '';
/******弹窗内容End*****/

/**商品ID*/
var commodity_id = -1;

//房屋设施数据
var roomDataArray;

////////////////////////
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

/////////////////////////
var submitUrl = '/wnk_business_app/v1.0.0/addCommodityByHotel';

mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});

		var self = plus.webview.currentWebview();
		//获得参数 商品分类
		choose_type_id = self.type_id;
		// 获得参数 商品ID
		commodity_id = self.commodity_id;
		//操作类型id(添加/删除)
		var type_operation = self.type_operation;

		if(commodity_id != undefined && commodity_id != null) {
			selectCommodityInfoById(commodity_id);
			submitUrl = '/wnk_business_app/v1.0.0/updateCommodityByHotel';
		}

		var title_head = document.getElementById("title_head");
		if(type_operation == 0) {
			title_head.innerHTML = "修改商品(酒店类)"
		} else if(type_operation == 1) {
			title_head.innerHTML = "添加商品(酒店类)"
		}

		//获取所有规格名称
		getAllGuiGeName();

		//获取所有分类
		getAllType();

		//获取所有房屋设施数据
		getRoomFacilitiesData();

		// 绑定图片选择事件
		document.getElementById("choosePhoto").addEventListener('tap', function() {
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

		// 绑定保存事件
		document.getElementById('addCommodity').addEventListener('tap', addCommodity);

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getAllType();
		});

		// 上/下架状态处理
		mui('.mui_switch_line').each(function() {
			this.addEventListener('toggle', function(event) {
				document.getElementById("line_commodity_state").innerHTML = event.detail.isActive ? "(上架)" : "(下架)";
				commodityState = event.detail.isActive ? 0 : 1;
			});
		});

		// 上传文件成功返回回调函数
		window.addEventListener('uploadImg', function(event) {
			var data = event.detail;
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

		//绑定库存限制开关
		guigeInventoryStateChange();

		//价格变化动态计算额外赠送的现金券
		getGiftCashNumByPrice(recording);

		//规格列表项弹窗事件
		mui('.guige').on('tap', '#donation_ratio_div', function() {
				currentItem = 'donation_ratio_div';
				showBottomPop(currentItem);
			})
			.on('tap', '#guige_time_cancel_reserve_div', function() {
				currentItem = 'guige_time_cancel_reserve_div';
				showBottomPop(currentItem);
			})
			.on('tap', '#guige_time_enter_div', function() {
				currentItem = 'guige_time_enter_div';
				showBottomPop(currentItem);
			})
			.on('tap', '#guige_time_check_out_div', function() {
				currentItem = 'guige_time_check_out_div';
				showBottomPop(currentItem);
			});

		//绑定列表项点击弹窗事件(根据不同项控制pop弹窗内容)
		mui('.weui-flex__item').on('tap', 'p', function() {
			var context_id = this.id;
			currentItem = context_id;
			showBottomPop(currentItem);
		});

		//绑定底部弹窗内容点击事件
		bottomPopClick();
	});

	//删除轮播图li标签
	function deletePhotoLi(index) {
		$("#photo_" + index).remove();
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
					mui.toast(data.msg);
				}
			},
		});
	}

	// 绑定规格中库存无限制点击事件
	function guigeInventoryStateChange() {
		document.getElementById('guige_Infinity_1').addEventListener('change', function() {
			var kucun_input_text = document.getElementById('guige_Inventory_1');
			if(this.checked) {
				kucun_input_text.value = '';
				kucun_input_text.placeholder = '无限制';
				kucun_input_text.readOnly = true;
			} else {
				kucun_input_text.value = '';
				kucun_input_text.placeholder = '请输入库存数量';
				kucun_input_text.readOnly = false;
			}
		}, false);
	}

	/*规格价格变化动态计算额外赠送的现金券
	 *参数：当前规格是第几项
	 */
	function getGiftCashNumByPrice(recording) {
		$("#guige_price_" + recording + "").bind('input propertychange', function() {
			var price = $(this).val();
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
		});
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

	//数字排序函数
	function sortNumber(a, b) {
		return a - b;
	}

	/*根据不同点击项显示不同的弹窗内容
	 * @params
	 * id_current_item:列表项id
	 */
	function showBottomPop(id_current_item) {
		$('#grids_bottom_pop a').remove();
		//TODO 填充数据
		if(id_current_item == "donation_ratio_div") {
			//消费赠送比例
			isMultiSelect = false;
			isRequiredSelect = true;
			title_pop = '消费赠送比例';
			tip_pop = '';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[0];

		} else if(id_current_item == "guige_time_cancel_reserve_div") {
			//预定取消时间
			isMultiSelect = false;
			isRequiredSelect = true;
			title_pop = '预定可取消时间';
			tip_pop = '在入住当日前几点可免费取消';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[1];

		} else if(id_current_item == "guige_time_enter_div") {
			//入住时间
			isMultiSelect = false;
			isRequiredSelect = true;
			title_pop = '入住时间';
			tip_pop = '几点后可以入住';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[2];

		} else if(id_current_item == "guige_time_check_out_div") {
			//退房时间
			isMultiSelect = false;
			isRequiredSelect = true;
			title_pop = '退房时间';
			tip_pop = '次日几点前退房';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[3];

		} else if(id_current_item == "facilities_area") {
			//面积
			isMultiSelect = false;
			isRequiredSelect = false;
			title_pop = '房间面积';
			tip_pop = '';
			isShowInput = true;
			tipInput = '请选择或输入房间面积';
			typeInput = 'number';
			unit_input = '㎡';
			contentData = roomDataArray[4];

		} else if(id_current_item == "facilities_breakfast") {
			//早餐
			isMultiSelect = false;
			isRequiredSelect = true;
			title_pop = '早餐份数';
			tip_pop = '提供几份早餐';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[5];

		} else if(id_current_item == "facilities_floor") {
			//楼层
			isMultiSelect = true;
			isRequiredSelect = false;
			title_pop = '所在楼层';
			tip_pop = '房间所在楼层';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[6];

		} else if(id_current_item == "facilities_windows") {
			//窗户
			isMultiSelect = false;
			isRequiredSelect = false;
			title_pop = '窗户';
			tip_pop = '房间是否有窗户';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[7];

		} else if(id_current_item == "facilities_lives") {
			//可住
			isMultiSelect = false;
			isRequiredSelect = true;
			title_pop = '可住人数(必填大于0)';
			tip_pop = '';
			isShowInput = true;
			tipInput = '请选择或输入可住人数';
			typeInput = 'number';
			unit_input = '';
			contentData = roomDataArray[8];

		} else if(id_current_item == "facilities_air_conditioner") {
			//空调
			isMultiSelect = false;
			isRequiredSelect = false;
			title_pop = '空调';
			tip_pop = '房间是否有空调';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[9];

		} else if(id_current_item == "facilities_bathroom") {
			//卫浴
			isMultiSelect = false;
			isRequiredSelect = false;
			title_pop = '卫浴';
			tip_pop = '卫浴情况';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[10];

		} else if(id_current_item == "facilities_broadband") {
			//宽带
			isMultiSelect = true;
			isRequiredSelect = false;
			title_pop = '宽带';
			tip_pop = '宽带和WIFI设施';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[11];

		} else if(id_current_item == "facilities_type_bed") {
			//床型
			isMultiSelect = false;
			isRequiredSelect = false;
			title_pop = '床型';
			tip_pop = '';
			isShowInput = true;
			tipInput = '请选择或输入床型';
			typeInput = 'text';
			unit_input = '';
			contentData = roomDataArray[12];

		} else if(id_current_item == "facilities_size_bed") {
			//床尺寸
			isMultiSelect = false;
			isRequiredSelect = true;
			title_pop = '床尺寸';
			tip_pop = '请选择床的尺寸';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[13];

		} else if(id_current_item == "facilities_num_bed") {
			//床数
			isMultiSelect = false;
			isRequiredSelect = true;
			title_pop = '床数';
			tip_pop = '请选择床的数量';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[14];

		} else if(id_current_item == "facilities_bathroom_matching") {
			//浴室配套
			isMultiSelect = true;
			isRequiredSelect = false;
			title_pop = '浴室配套';
			tip_pop = '请选择浴室配套设施';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[15];

		} else if(id_current_item == "facilities_electric") {
			//生活电器
			isMultiSelect = true;
			isRequiredSelect = false;
			title_pop = '生活电器';
			tip_pop = '请选择生活电器';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[16];

		} else if(id_current_item == "facilities_media") {
			//媒体设备
			isMultiSelect = true;
			isRequiredSelect = false;
			title_pop = '媒体设备';
			tip_pop = '请选择媒体设备';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[17];

		} else if(id_current_item == "facilities_window_description") {
			//窗户说明
			isMultiSelect = true;
			isRequiredSelect = false;
			title_pop = '窗户说明';
			tip_pop = '请选择窗户位置说明';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[18];

		} else if(id_current_item == "facilities_room_features") {
			//房间特色
			isMultiSelect = true;
			isRequiredSelect = false;
			title_pop = '房间特色';
			tip_pop = '请选择房间特色';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[19];

		} else if(id_current_item == "facilities_others") {
			//其它设施
			isMultiSelect = true;
			isRequiredSelect = false;
			title_pop = '其它设施';
			tip_pop = '请选择其它设施';
			isShowInput = false;
			tipInput = '';
			unit_input = '';
			contentData = roomDataArray[20];
		}

		//标题
		$('#title_bottom_pop').text(title_pop);
		//提示
		$('#tips_bottom_pop').text(tip_pop);
		//input提示内容
		$("#input_bottom_pop").attr('placeholder', tipInput);
		$('#input_bottom_pop').val("");
		//控制输入框类型
		$("#input_bottom_pop").attr('type', typeInput);
		//内容
		if(isShowInput) {
			//输入框、单位
			$('.input_div').show();
			$('#unit_input').text(unit_input);
		} else {
			$('.input_div').hide();
		}
		for(var i = 0; i < contentData.length; i++) {
			var html =
				'<a href="javascript:;" class="weui-grid js_grid" data-checked="false">' +
				'<p class="weui-grid__label grid_item_ratio">' + contentData[i] + '</p>' +
				'</a>';
			$("#grids_bottom_pop").append(html);
		}

		console.log('是否多选：' + isMultiSelect + ';是否必选：' + isRequiredSelect);
		//是否必选(非必选显示不填写按钮)
		if(isRequiredSelect) {
			$('#close_bottom_pop').hide();
		} else {
			$('#close_bottom_pop').show();
		}
		//是否多选(单选不显示确定按钮，点解直接完成)
		if(isMultiSelect) {
			$('#confirm_bottom_pop').show();
		} else {
			if(isShowInput) {
				//单选但是可手动输入
				$('#confirm_bottom_pop').show();
			} else {
				$('#confirm_bottom_pop').hide();
			}
		}

		//TODO 显示弹窗
		$("#bottom_pop").popup('open');
	}

	/*底部弹窗内容点击事件*/
	function bottomPopClick() {
		var content_selected = '';
		var arraySelected = new Array();

		//pop弹窗列表项点击事件
		$("#grids_bottom_pop").on('click', 'a', function() {
			//是否多选
			if(isMultiSelect) {
				//选中、取消动态改变自定义属性data-checked
				console.log("**********点击");
				var checked_state = $(this).attr('data-checked');

				if(checked_state == 'false') {
					//未选中
					$(this).children('p').addClass('grid_item_ratio_selected');
					$(this).attr('data-checked', 'true');
				} else if(checked_state == 'true') {
					//已选中
					$(this).children('p').removeClass('grid_item_ratio_selected');
					$(this).attr('data-checked', 'false');
				}
			} else {
				//点击选中效果
				$(this).siblings().children('p').removeClass('grid_item_ratio_selected');
				$(this).children('p').addClass('grid_item_ratio_selected');
				$(this).siblings('a').attr('data-checked', 'false');
				$(this).attr('data-checked', 'true');
				//可输入
				if(isShowInput) {
					var content_selected = $(this).children('p').text();
					console.log("可输入：" + content_selected);
					$("#input_bottom_pop").val(content_selected);
				}

				//单选且没有输入框的，点击列表项直接关闭弹窗完成选择操作
				if(isShowInput == false) {
					//遍历元素，取出data-checked=true的元素内容作为选中项
					var allChildren = $('#grids_bottom_pop').children('a');
					for(var i = 0; i < allChildren.length; i++) {
						var itemCheckedState = allChildren[i].getAttribute('data-checked');
						var itemContent = allChildren[i].children[0].innerHTML;
						if(itemCheckedState == 'true') {
							arraySelected.push(itemContent);
						}
					}
					//join方法将数组转换成字符串并以指定字符分隔开
					if(arraySelected.length == 0) {
						content_selected = '-';
					} else {
						content_selected = arraySelected.join(',');
					}
					//点击列表项直接完成确定操作
					checkedConfirm(content_selected, arraySelected);
				}
			}
		});

		//弹窗确定、取消点击事件
		mui('#bottom_pop').on('tap', '#confirm_bottom_pop', function() {
				//有无input，有的话取input的值，没有就取点击项的值
				if(isShowInput) {
					var content_input = $('#input_bottom_pop').val();
					console.log("input内容：" + content_input);
					if(content_input != "" && content_input != undefined) {
						arraySelected.push(content_input);
					}
				} else {
					//遍历元素，取出data-checked=true的元素内容作为选中项
					var allChildren = $('#grids_bottom_pop').children('a');
					for(var i = 0; i < allChildren.length; i++) {
						var itemCheckedState = allChildren[i].getAttribute('data-checked');
						var itemContent = allChildren[i].children[0].innerHTML;
						if(itemCheckedState == 'true') {
							arraySelected.push(itemContent);
						}
					}
				}

				//join方法将数组转换成字符串并以指定字符分隔开
				if(arraySelected.length == 0) {
					content_selected = '-';
				} else {
					content_selected = arraySelected.join(',');
				}

				//确定后的操作
				checkedConfirm(content_selected, arraySelected);

			})
			.on('tap', '#close_bottom_pop', function() {
				//不填写
				content_selected = "-";
				if(currentItem == 'facilities_area') {
					//房屋面积
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
					console.log('*********房间面积');
				} else if(currentItem == 'facilities_floor') {
					//楼层
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_windows') {
					//窗户
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_air_conditioner') {
					//空调
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_bathroom') {
					//卫浴
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_broadband') {
					//宽带
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_type_bed') {
					//床型
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_bathroom_matching') {
					//浴室配套
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();

				} else if(currentItem == 'facilities_electric') {
					//生活电器
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_media') {
					//媒体设备
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_window_description') {
					//窗户说明
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_room_features') {
					//房间特色
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				} else if(currentItem == 'facilities_others') {
					//其它设施
					$("#" + currentItem + "").children('span').text(content_selected);
					closeView();
				}
			})
	}

	//弹窗选择内容确定后的操作
	function checkedConfirm(content_selected, arraySelected) {
		//确定
		if(currentItem == 'donation_ratio_div') {
			//消费赠送
			$('#num_donation_ratio_1').text(content_selected + "%");
			closeView();
			console.log('*********消费赠送');
			//计算赠送现金券数量
			getGiftCashNumByRatio(recording);
		} else if(currentItem == 'guige_time_cancel_reserve_div') {
			//预定取消
			$('#guige_time_cancel_reserve').text(content_selected);
			console.log('*********预定取消');
			closeView();
		} else if(currentItem == 'guige_time_enter_div') {
			//入住时间
			$('#guige_time_enter').text(content_selected);
			closeView();
		} else if(currentItem == 'guige_time_check_out_div') {
			//退房时间
			$('#guige_time_check_out').text(content_selected);
			closeView();
		} else if(currentItem == 'facilities_area') {
			//房屋面积
			$("#" + currentItem + "").children('span').text(content_selected + "㎡");
			closeView();
			console.log('*********房间面积');
		} else if(currentItem == 'facilities_breakfast') {
			//早餐
			$("#" + currentItem + "").children('span').text(content_selected + "份");
			closeView();
			console.log('*********早餐');
		} else if(currentItem == 'facilities_floor') {
			//楼层
			if(arraySelected.length > 2) {
				//对楼层排序，判断是否连续楼层
				var isContinue = true;
				var sorted = arraySelected.sort(sortNumber);
				for(var i = 0; i < sorted.length - 1; i++) {
					var intCurrent = parseInt(sorted[i]);
					var intNext = parseInt(sorted[i + 1]);
					if((intCurrent + 1) != intNext) {
						isContinue = false;
						break;
					} else {
						isContinue = true;
					}
				}
				console.log("排序后的楼层:" + sorted + ";是否连续:" + isContinue);
				if(isContinue) {
					//连续
					content_selected = sorted[0] + "-" + sorted[sorted.length - 1];
				}
			}
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_windows') {
			//窗户
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_lives') {
			//可住
			$("#" + currentItem + "").children('span').text(content_selected + "人");
			closeView();
		} else if(currentItem == 'facilities_air_conditioner') {
			//空调
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_bathroom') {
			//卫浴
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_broadband') {
			//宽带
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_type_bed') {
			//床型
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_size_bed') {
			//床尺寸
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_num_bed') {
			//床数
			$("#" + currentItem + "").children('span').text(content_selected + "张");
			closeView();
		} else if(currentItem == 'facilities_bathroom_matching') {
			//浴室配套
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();

		} else if(currentItem == 'facilities_electric') {
			//生活电器
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_media') {
			//媒体设备
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_window_description') {
			//窗户说明
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_room_features') {
			//房间特色
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		} else if(currentItem == 'facilities_others') {
			//其它设施
			$("#" + currentItem + "").children('span').text(content_selected + "");
			closeView();
		}
		//确定后清空选中内容
		content_selected = "";
		arraySelected.splice(0, arraySelected.length);
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

	//获取酒店房屋设施数据
	function getRoomFacilitiesData() {
		//模拟数据
		roomDataArray = new Array();
		var ratioArray = ['5', '10', '20', '30', '40', '50', '60'];
		roomDataArray.push(ratioArray);
		var timeCancelArray = ['12:00', '13:00', '14:00', '15:00', '16:00'];
		roomDataArray.push(timeCancelArray);
		var timeEnterArray = ['10:00', '13:00', '14:00', '15:00', '16:00'];
		roomDataArray.push(timeEnterArray);
		var timeCheckoutArray = ['16:00', '17:00', '18:00', '19:00'];
		roomDataArray.push(timeCheckoutArray);
		var areaArray = ['20', '25', '30', '35'];
		roomDataArray.push(areaArray);
		var breakfastArray = ['0', '1', '2', '3', '4'];
		roomDataArray.push(breakfastArray);
		var floorArray = ['3', '4', '5', '6', '7', '8', '9'];
		roomDataArray.push(floorArray);
		var windowArray = ['有', '无'];
		roomDataArray.push(windowArray);
		var livesArray = ['1', '2', '3', '4'];
		roomDataArray.push(livesArray);
		var airArray = ['有', '无'];
		roomDataArray.push(airArray);
		var bathroomArray = ['独立卫浴', '公共卫浴', '无'];
		roomDataArray.push(bathroomArray);
		var broadbandArray = ['wifi', '宽带', '无'];
		roomDataArray.push(broadbandArray);
		var typeBedArray = ['大床', '单人床', '圆床'];
		roomDataArray.push(typeBedArray);
		var sizeBedArray = ['1.2*2.0', '1.5*2.0', '1.25*2.0'];
		roomDataArray.push(sizeBedArray);
		var numBedArray = ['1', '2', '3'];
		roomDataArray.push(numBedArray);
		var facilitiesBathroomArray = ['拖鞋', '电吹风', '浴袍', '热水'];
		roomDataArray.push(facilitiesBathroomArray);
		var elecArray = ['电水壶', '洗衣机', '电熨斗'];
		roomDataArray.push(elecArray);
		var mediaArray = ['电话', '电视', '电脑', '有线电视'];
		roomDataArray.push(mediaArray);
		var windowDescribeArray = ['天窗', '朝向走廊'];
		roomDataArray.push(windowDescribeArray);
		var roomFeaturesArray = ['舒适宽敞', '干净卫生', '魔幻单间'];
		roomDataArray.push(roomFeaturesArray);
		var otherArray = ['阳台', '写字台', '沙发', '座椅'];
		roomDataArray.push(otherArray);
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
	//添加商品
	function addCommodity() {
		if(isHaveCommodityType == -1) {
			toast(0, "请先创建商品分类");
		} else {
			//-------------------参数获取----------------------------//
			// 商品名称
			var name = document.getElementById("name").value;
			// 商品价格
			var price = document.getElementById("guige_price_1").value;
			// 所属分类
			var type_select = document.getElementById("type_select");
			var type_id = type_select.options[type_select.selectedIndex].value;
			//商品图片
			var img_titile = '';
			var a = $('#lunbo_photo_ul > li > img ');
			for(var i = 0; i < a.length; i++) {
				img_titile += a[i].getAttribute("data-img") + "|";
			}

			//-----规格相关
			// 规格名称
			var guige_name = document.getElementById('guige_name_1').value;
			// 规格价格
			var guige_price = document.getElementById('guige_price_1').value;
			// 规格库存
			var guige_Inventory_1 = document.getElementById('guige_Inventory_1').value;
			// 如果是无限制则把库存改为-1;
			if(document.getElementById('guige_Infinity_1').checked == true) {
				guige_Inventory_1 = -1;
			}
			// 消费赠送比例
			var num_donation_ratio_1 = document.getElementById('num_donation_ratio_1').innerHTML.split('%')[0];

			// 预计可取消
			var guige_cancel_reserve = document.getElementById('guige_cancel_reserve').checked == true ? 0 : 1;
			// 取消时间
			var guige_time_cancel_reserve = document.getElementById('guige_time_cancel_reserve').innerHTML;
			// 入住时间
			var guige_time_enter = document.getElementById('guige_time_enter').innerHTML;
			// 退房时间
			var guige_time_check_out = document.getElementById('guige_time_check_out').innerHTML;

			//-----房间设施
			// 面积
			var facilities_area_content = document.getElementById('facilities_area_content').innerHTML;
			// 早餐 
			var facilities_breakfast_content = document.getElementById('facilities_breakfast_content').innerHTML.substring(0, 1);
			// 楼层
			var facilities_floor_content = document.getElementById('facilities_floor_content').innerHTML;
			// 窗户
			var facilities_windows_content = document.getElementById('facilities_windows_content').innerHTML;
			// 可住人数
			var facilities_lives_content = document.getElementById('facilities_lives_content').innerHTML.substring(0, 1);
			// 空调
			var facilities_air_conditioner_content = document.getElementById('facilities_air_conditioner_content').innerHTML;
			// 卫浴
			var facilities_bathroom_content = document.getElementById('facilities_bathroom_content').innerHTML;
			// 宽带
			var facilities_broadband_content = document.getElementById('facilities_broadband_content').innerHTML;
			// 床型
			var facilities_type_bed_content = document.getElementById('facilities_type_bed_content').innerHTML;
			// 床尺寸
			var facilities_size_bed_content = document.getElementById('facilities_size_bed_content').innerHTML;
			// 床数量
			var facilities_num_bed_content = document.getElementById('facilities_num_bed_content').innerHTML.substring(0, 1);
			// 浴室配套
			var facilities_bathroom_matching_content = document.getElementById('facilities_bathroom_matching_content').innerHTML;
			// 生活电器
			var facilities_electric_content = document.getElementById('facilities_electric_content').innerHTML;
			// 媒体设施
			var facilities_media_content = document.getElementById('facilities_media_content').innerHTML;
			// 窗户说明
			var facilities_window_description_content = document.getElementById('facilities_window_description_content').innerHTML;
			// 房间特色
			var facilities_room_features_content = document.getElementById('facilities_room_features_content').innerHTML;
			// 其他设施
			var facilities_others_content = document.getElementById('facilities_others_content').innerHTML;

			//-------------------参数检查----------------------------//
			if(name == undefined || name == null || (name) == '') {
				plus.nativeUI.toast("请输入商品名称");
				return;
			}
			if(type_id == undefined || type_id == null || (type_id) == '') {
				plus.nativeUI.toast("请选择商品所属分类");
				return;
			}
			if(img_titile == undefined || img_titile == null || (img_titile) == '') {
				plus.nativeUI.toast("请上传商品图片");
				return;
			}
			if(guige_name == undefined || guige_name == null || (guige_name) == '') {
				plus.nativeUI.toast("请输入规格名称");
				return;
			}
			if(guige_price == undefined || guige_price == null || (guige_price) == '') {
				plus.nativeUI.toast("请输入规格价格");
				return;
			}
			if(guige_Inventory_1 == undefined || guige_Inventory_1 == null || (guige_Inventory_1) == '') {
				plus.nativeUI.toast("请输入规格库存");
				return;
			}
			if(num_donation_ratio_1 == undefined || num_donation_ratio_1 == null || (num_donation_ratio_1) == '') {
				plus.nativeUI.toast("请选择消费赠送比例");
				return;
			}
			if(guige_time_cancel_reserve == undefined || guige_time_cancel_reserve == null || (guige_time_cancel_reserve) == '-') {
				plus.nativeUI.toast("请选择取消时间");
				return;
			}
			if(guige_time_enter == undefined || guige_time_enter == null || (guige_time_enter) == '-') {
				plus.nativeUI.toast("请选择入住时间");
				return;
			}
			if(guige_time_check_out == undefined || guige_time_check_out == null || (guige_time_check_out) == '-') {
				plus.nativeUI.toast("请选择退房时间");
				return;
			}
			if(facilities_breakfast_content == undefined || facilities_breakfast_content == null || (facilities_breakfast_content) == '-') {
				plus.nativeUI.toast("请选择早餐");
				return;
			}
			if(facilities_lives_content == undefined || facilities_lives_content == null || (facilities_lives_content) == '-') {
				plus.nativeUI.toast("请选择可住人数");
				return;
			}
			if(facilities_size_bed_content == undefined || facilities_size_bed_content == null || (facilities_size_bed_content) == '-') {
				plus.nativeUI.toast("请选择床尺寸");
				return;
			}
			if(facilities_num_bed_content == undefined || facilities_num_bed_content == null || (facilities_num_bed_content) == '-') {
				plus.nativeUI.toast("请选择床数");
				return;
			}

			var dataObj = {
				'id': document.getElementById('commodities_id').value,
				'specifications_id': document.getElementById('specifications_id').value,
				'name': name,
				'price': price,
				'state': commodityState,
				'photo': img_titile,
				'business_id': storage["business_id"],
				'type_id': type_id,
				'is_make_wnk': is_make_wnk,
				'specifications_name': guige_name,
				'guige_price': guige_price,
				'inventory': guige_Inventory_1,
				'gift_noun': num_donation_ratio_1,
				'cancel_reserve': guige_cancel_reserve,
				'time_cancel_reserve': guige_time_cancel_reserve,
				'time_enter': guige_time_enter,
				'time_check_out': guige_time_check_out,
				'area': facilities_area_content,
				'breakfast': facilities_breakfast_content,
				'floor': facilities_floor_content,
				'windows': facilities_windows_content,
				'lives': facilities_lives_content,
				'air_conditioner': facilities_air_conditioner_content,
				'bathroom': facilities_bathroom_content,
				'broadband': facilities_broadband_content,
				'type_bed': facilities_type_bed_content,
				'size_bed': facilities_size_bed_content,
				'num_bed': facilities_num_bed_content,
				'bathroom_matching': facilities_bathroom_matching_content,
				'electric': facilities_electric_content,
				'media': facilities_media_content,
				'window_description': facilities_window_description_content,
				'room_features': facilities_room_features_content,
				'others': facilities_others_content
			};

			toast(2, "打开loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + submitUrl,
				type: "POST",
				dataType: 'json',
				data: dataObj,
				success: function(data) {
					toast(3, "关闭loading");
					if(parseInt(data.status) === 0) {
						plus.nativeUI.toast(data.msg);
						plus.webview.close('add_hotel.html');
						plus.webview.close('goods_type_chose.html');
					} else {
						plus.nativeUI.toast(data.msg);
					}
				}
			});
		}
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

//关闭弹窗
function closeView() {
	$.closePopup();
}

/**
 * 根据商品ID查询商品信息
 * 
 * 参数1 : 商品ID
 */
function selectCommodityInfoById(commodityId) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectCommodityInfoAndCommodityExpandHotelInfoById",
		type: "POST",
		dataType: 'json',
		data: {
			businessId: storage['business_id'],
			commodityId: commodityId
		},
		success: function(data) {
			toast(3, "关闭loading");
			if(parseInt(data.status) === 0) {
				var basicInfo = data.data[0];
				var normInfo = data.data[1];
				var facilitiesInfo = data.data[2];
				//-------------------参数获取----------------------------//
				document.getElementById('commodities_id').value = basicInfo.id;
				// 规格iD

				// 商品名称
				document.getElementById("name").value = basicInfo.name;
				// 商品价格
				document.getElementById("guige_price_1").value = basicInfo.price;
				// 所属分类
				$('#type_select').val(basicInfo.type_id);
				//商品图片
				var photoArr = basicInfo.photo.split('|');
				var imgUl = $('#lunbo_photo_ul');
				for(var i = 0; i < photoArr.length; i++) {
					if(photoArr[i] != undefined && photoArr != null && String(photoArr[i]) != '') {
						var html = '' +
							'<li id="photo_' + currentPhotoIndex + '" class="weui-uploader__file">' +
							'	<img src="' + data.data[3] + photoArr[i] + '" class="phots" data-img="' + photoArr[i] + '"/>' +
							'	<span class="mui-badge mui-badge-red myBadgeposition" name="' + currentPhotoIndex + '">x</span>' +
							'</li>';
						imgUl.append(html);
					}
				}

				//-----规格相关
				document.getElementById('specifications_id').value = normInfo.id;
				// 规格名称
				document.getElementById('guige_name_1').value = normInfo.specifications_name;
				// 规格价格
				document.getElementById('guige_price_1').value = normInfo.price;
				// 规格库存
				document.getElementById('guige_Inventory_1').value = normInfo.inventory;
				// 如果是无限库存
				if(parseInt(normInfo.inventory) === -1) {
					document.getElementById('guige_Infinity_1').checked = true;
					document.getElementById('guige_Inventory_1').value = '';
					document.getElementById('guige_Inventory_1').placeholder = '无限制';
					document.getElementById('guige_Inventory_1').readOnly = '无限制';
				}
				// 消费赠送比例
				document.getElementById('num_donation_ratio_1').innerHTML = normInfo.gift_noun + '%';

				console.log(facilitiesInfo.cancel_reserve);
				// 预计可取消
				if(facilitiesInfo.cancel_reserve == 0) {
					$('#guige_cancel_reserve').prop("checked", true);
				} else {
					$('#guige_cancel_reserve').prop("checked", false);
				}
				// 取消时间
				document.getElementById('guige_time_cancel_reserve').innerHTML = facilitiesInfo.time_cancel_reserve;
				// 入住时间
				document.getElementById('guige_time_enter').innerHTML = facilitiesInfo.time_enter;
				// 退房时间
				document.getElementById('guige_time_check_out').innerHTML = facilitiesInfo.time_check_out;

				//-----房间设施
				// 面积
				document.getElementById('facilities_area_content').innerHTML = facilitiesInfo.area;
				// 早餐
				document.getElementById('facilities_breakfast_content').innerHTML = facilitiesInfo.breakfast + '份';
				// 楼层
				document.getElementById('facilities_floor_content').innerHTML = facilitiesInfo.floor;
				// 窗户
				document.getElementById('facilities_windows_content').innerHTML = facilitiesInfo.windows;
				// 可住人数
				document.getElementById('facilities_lives_content').innerHTML = facilitiesInfo.lives + '人';
				// 空调
				document.getElementById('facilities_air_conditioner_content').innerHTML = facilitiesInfo.air_conditioner;
				// 卫浴
				document.getElementById('facilities_bathroom_content').innerHTML = facilitiesInfo.bathroom;
				// 宽带
				document.getElementById('facilities_broadband_content').innerHTML = facilitiesInfo.broadband;
				// 床型
				document.getElementById('facilities_type_bed_content').innerHTML = facilitiesInfo.type_bed;
				// 床尺寸
				document.getElementById('facilities_size_bed_content').innerHTML = facilitiesInfo.size_bed;
				// 床数量
				document.getElementById('facilities_num_bed_content').innerHTML = facilitiesInfo.num_bed + '张';
				// 浴室配套
				document.getElementById('facilities_bathroom_matching_content').innerHTML = facilitiesInfo.bathroom_matching;
				// 生活电器
				document.getElementById('facilities_electric_content').innerHTML = facilitiesInfo.electric;
				// 媒体设施
				document.getElementById('facilities_media_content').innerHTML = facilitiesInfo.media;
				// 窗户说明
				document.getElementById('facilities_window_description_content').innerHTML = facilitiesInfo.window_description;
				// 房间特色
				document.getElementById('facilities_room_features_content').innerHTML = facilitiesInfo.room_features;
				// 其他设施
				document.getElementById('facilities_others_content').innerHTML = facilitiesInfo.others;

			}
		}
	});
}