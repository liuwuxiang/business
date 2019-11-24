'use strict';
var storage = null;
//图片上传类别(0-轮播图,1-封面图)
var photoUplodType = 0;
//一级标签名称
var one_tag_name = "";
//商户是否可修改标签(-1不可,0可修改)
var set_tag_state = -1;

mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {

	//当前图片index值
	var currentPhotoIndex = -1;

	mui.ready(function() {

		// 防止手机弹出输入法是tar跟着跑
// 		plus.webview.currentWebview().setStyle({
// 			height: 'd'
// 		});
		// 本地存储
		storage = window.localStorage;
		// 获取服务内容信息
		// getBusinessLable('0');
		// 获取特色内容信息
		// getBusinessLable('1');
		// 初始化店铺区域
		initArea();
		// 获取店铺数据
		getInformationData();
		// 初始化商家标签
		initBusinessTag();
		// 初始化绑定事件
		initEventListener();

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getInformationData();
		});

		// 地图点击选择地点后
		window.addEventListener('mapOk', function(event) {
			// console.log(JSON.stringify(event.detail));
			var data = event.detail;
			okPos(data.adders, data.latitude, data.longitude);
		});

		// 图片上传返回处理
		window.addEventListener('uploadImg', function(event) {
			var data = event.detail;
			console.log(JSON.stringify(data));
			if (photoUplodType == 0) {
				currentPhotoIndex++;
				var html = '' +
					'<li id="photo' + currentPhotoIndex + '" class="weui-uploader__file">' +
					'	<img src="' + data.src + '" class="phots"/>' +
					'	<span class="mui-badge mui-badge-red myBadgeposition" name="' + currentPhotoIndex + '">x</span>' +
					'</li>';

				$("#lunbo_photo_ul").append(html);
			} else {
				document.getElementById("store_cover_photo").src = data.src;
			}
		})

		$('#store_describe').focus(function(){
			    setTimeout(function(){
				  window.scrollTo(0,document.body.clientHeight);
				}, 500); 
		});

	});

	/**
	 * 初始化绑定事件
	 */
	function initEventListener() {
		// 店铺滚动图选择事件
		document.getElementById("header_file").addEventListener('change', chooseHeaderChangeFile);
		document.getElementById('setInformationData').addEventListener('tap', setInformationData);
		//		document.getElementById('setInformationData').addEventListener('tap', saveBusinessTag);
		// 滚动图上的删除按钮点击事件
		mui('#lunbo_photo_ul').on('tap', 'li > .myBadgeposition', function() {
			deletePhotoLi(this.getAttribute('name'));
		});
		// 		// 特色内容点击事件
		// 		document.getElementById('teseContent').addEventListener('tap', function() {
		// 			//$('#teseContent').select('open');
		// 		});

		// 		// 服务内容点击事件
		// 		document.getElementById('fuwuContent').addEventListener('tap', function() {
		// 			//$('#fuwuContent').select('open');
		// 		});
		// 营业时间点击事件
		document.getElementById('hours').addEventListener('tap', function() {
			$("#hours").picker({
				title: "请选择营业时间",
				cols: [{
					textAlign: 'left',
					displayValues: [
						'00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
						'10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
						'20', '21', '22', '23'
					],
					values: [
						'00时', '01时', '02时', '03时', '04时', '05时', '06时', '07时', '08时', '09时',
						'10时', '11时', '12时', '13时', '14时', '15时', '16时', '17时', '18时', '19时',
						'20时', '21时', '22时', '23时'
					],
				}, {
					textAlign: 'center',
					values: ['-']
				}, {
					textAlign: 'right',
					displayValues: [
						'00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
						'10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
						'20', '21', '22', '23'
					],
					values: [
						'00时', '01时', '02时', '03时', '04时', '05时', '06时', '07时', '08时', '09时',
						'10时', '11时', '12时', '13时', '14时', '15时', '16时', '17时', '18时', '19时',
						'20时', '21时', '22时', '23时'
					],
				}],
				inputReadOnly: true,
				onChange: function(result) {
					document.getElementById('hours').setAttribute('value', result.displayValue[0] + '时 - ' + result.displayValue[
						1] + '时');
				}
			});
		});
		// 商家位置点击事件
		document.getElementById('pos').addEventListener('tap', function() {
			// 先关闭打开的地图窗口. 防止打开到旧的窗口
			plus.webview.close('shop_information_map.html');
			mui.openWindow({
				url: './shop_information_map.html',
				id: 'shop_information_map.html.html',
				styles: {
					top: '0px',
					bottom: '0px',
				},
				createNew: true,
				extras: {
					lat: document.getElementById('lat').value + '',
					longt: document.getElementById('longt').value + '',
					addrs: document.getElementById('pos').value + ''
				}
			});
		});

		mui('#lunbo_photo_ul').on('tap', 'li > img', function() {
			plus.nativeUI.previewImage([this.getAttribute('src')], {
				indicator: 'none'
			});
		});

		document.getElementById('choosePhoto').addEventListener('tap', function() {
			photoUplodType = 0;
			var pl = $('#lunbo_photo_ul > li');
			if (pl.length > 2) {
				mui.alert("最多上传三张", "猛戳商家版");
				return;
			}

			if (mui.os.plus) {
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
					switch (b.index) {
						case 0:
							break;
						case 1:
							getImage(640, 360); /*拍照*/
							break;
						case 2:
							galleryImg(640, 360); /*打开相册*/
							break;
					}
				})
			}
		});

		document.getElementById('choosePhotoCover').addEventListener('tap', function() {
			photoUplodType = 1;
			if (mui.os.plus) {
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
					switch (b.index) {
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

	}

	//拍照 
	function getImage(w, h) {
		// path 
		plus.camera.getCamera().captureImage(function(path) {
			plus.io.resolveLocalFileSystemURL(path, function(entry) {
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
		//		imgPath = photoCutting(imgPath);
		//		console.log("imgPath=="+imgPath);
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
		if (status == 200) {
			var data = JSON.parse(t.responseText);
			if (photoUplodType == 0) {
				currentPhotoIndex++;
				var html = '' +
					'<li id="photo' + currentPhotoIndex + '" class="weui-uploader__file">' +
					'	<img src="' + data.data.src + '" class="phots"/>' +
					'	<span class="mui-badge mui-badge-red myBadgeposition" name="' + currentPhotoIndex + '">x</span>' +
					'</li>';

				$("#lunbo_photo_ul").append(html);
			} else {
				document.getElementById("store_cover_photo").src = data.data.src;
			}

			toast(3, "关闭lodding")
		} else {
			console.log("上传失败：" + JSON.stringify(t));
			mui.toast("图片上传失败");
			toast(3, "关闭lodding")
		}
	}

	//删除轮播图li标签
	function deletePhotoLi(index) {
		$("#photo" + index).remove();
	}

	/**
	 *  获取服务/特色内容数据 
	 * @param {Object} type  0 :服务内容 1:特色内容
	 */
	function getBusinessLable(type) {
		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var retJson = JSON.parse(xhr.responseText);
				if (retJson.data.length <= 0) {
					mui.alert("无特色或服务内容.请联系管理员");
				} else if (type == 0) {
					initFuwuSelect(retJson.data);
				} else {
					initTeseSelect(retJson.data);
				}

			}
		}
		xhr.open('POST', mMain.url + '/wnk_business_app/v1.0.0/getBusinessLabel', true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send('business_id=' + storage["business_id"] + '&type=' + type);
	}

	/**
	 * 初始化特色内容选择列表
	 * @param {Object} data
	 */
	function initTeseSelect(data) {
		/*
		$('#teseContent').select({
			title: "特色内容",
			multi: true,
			items: data,
			onChange: function(d) {
				$("input[name=teseContent]").val(d.values);
				$('#teseContent').val(d.titles);
			}
		});
		*/
	}

	/**
	 * 初始化服务内容选择列表
	 * @param {Object} data
	 */
	function initFuwuSelect(data) {
		/*
		$('#fuwuContent').select({
			title: "服务内容",
			multi: true,
			items: data,
			onChange: function(d) {
				$("input[name=fuwuContent]").val(d.values);
				$('#fuwuContent').val(d.titles);
			}
		});
		*/
	}

	/**
	 * 初始化所在位置
	 * @param {Object} data
	 */
	function initArea() {
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business_app/v1.0.0/selectBusinessWnkBusinessRegionAll',
			type: "POST",
			dataType: 'json',
			async: false,
			data: {
				business_id: window.localStorage['business_id']
			},
			success: function(data) {
				if (data.status == 0) {

					var arr = [];
					for (var i = 0; i < data.data.length; i++) {
						var obj = data.data[i];
						arr.push({
							title: obj.name,
							value: obj.name
						});
					}

					$('#area').select({
						title: '店铺区域',
						multi: false,
						items: arr,
						onChange: function(d) {
							$("input[name=area]").val(d.values);
							$('#area').val(d.titles);
						}
					});
				}
				// 				$('#area').select({
				// 					title: "店铺区域",
				// 					multi: false,
				// 					items: [
				// 						{"title":"城中","value":'城中'},
				// 						{"title":"城东","value":'城东'},
				// 						{"title":"城南","value":'城南'},
				// 						{"title":"城西","value":'城西'},
				// 						{"title":"城北","value":'城北'},
				// 						],
				// 					onChange: function(d) {
				// 						$("input[name=area]").val(d.values);
				// 						$('#area').val(d.titles);
				// 					},
				// 				});
			}
		});
	}

	//获取店铺数据
	function getInformationData() {
		toast(2, "打开loading");
		$("#lunbo_photo_ul li").remove();
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business_app/v1.0.0/getStoreInformation',
			type: "POST",
			dataType: 'json',
			async: false,
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				toast(3, "关闭loading");
				if (data.status == 0) {

					document.getElementById('pos').value = data.data.position_name;
					document.getElementById('lat').value = data.data.lat;
					document.getElementById('longt').value = data.data.longt;
					document.getElementById('hours').value = data.data.business_hours;

					// 					document.getElementsByName('teseContent')[0].value = data.data.tese_label;
					// 					initLabelValue(0, data.data.tese_label);
					// 					document.getElementsByName('fuwuContent')[0].value = data.data.fuwu_label;
					// 					initLabelValue(1, data.data.fuwu_label);

					document.getElementsByName('area')[0].value = data.data.area;
					// initLabelValue(2, data.data.area);
					document.getElementById('area').setAttribute('value', data.data.area);
					document.getElementById('area').setAttribute('data-value', data.data.area);

					document.getElementById("store_name").value = data.data.name;
					document.getElementById("address").value = data.data.address;
					document.getElementById("mobile").value = data.data.mobile;
					document.getElementById("store_describe").value = data.data.store_describe;
					document.getElementById("store_cover_photo").src = data.data.cover_photo;
					document.getElementById("positive_price").value = data.data.positive_price;
					var one_tag_name_current = data.data.one_tag_name;
					if (one_tag_name_current == undefined || one_tag_name_current == "") {
						one_tag_name = "";
					} else {
						one_tag_name = one_tag_name_current + " - ";
					}
					set_tag_state = data.data.set_tag_state;
					if (set_tag_state == -1) {
						$("#wnk_business_tag_li").hide();
					}
					var list = data.data.photos;
					for (var index = 0; index < list.length; index++) {
						currentPhotoIndex = index;
						var obj = list[index];
						var html = "<li id=\"photo" + index + "\">" +
							"<img src=\"" + obj + "\" class=\"photo_img\"/>" +
							"<img src=\"../../static/images/wnk_business/delete_icon.png\" class=\"delete_button\" name=\"" + index +
							"\"/>" +
							"</li>";

						html = '' +
							'<li id="photo' + index + '" class="weui-uploader__file">' +
							'	<img src="' + obj + '" class="phots"/>' +
							'	<span class="mui-badge mui-badge-red myBadgeposition" name="' + index + '">x</span>' +
							'</li>';

						$("#lunbo_photo_ul").append(html);
					}
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	// 初始化商家标签
	function initBusinessTag() {
		var url = mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessTowTag";
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var ret = JSON.parse(xhr.responseText);
				if (parseInt(ret.status) === 0) {
					if (ret.data.length != 0) {
						var business_tag_arr = [];
						for (var i = 0; i < ret.data.length; i++) {
							var data = ret.data[i];
							business_tag_arr[i] = {
								value: data.id,
								title: data.name
							};
						}
						//console.log(JSON.stringify(business_tag_arr));
						$('#business_tag').select({
							title: one_tag_name + "标签选择",
							multi: false,
							items: business_tag_arr,
							onChange: function(d) {
								$("input[name=business_tag]").val(d.values);
								if (d.titles != undefined) {
									$('#business_tag').val(one_tag_name + d.titles);
								}

							}
						});
						// 获取商家已经选择的字标签
						getBusinessTagById();
					}
				}
			}
		}
		xhr.open('POST', url);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send('business_id=' + storage['business_id']);
	}
	// 获取商家已选中的标签并且初始化
	function getBusinessTagById() {
		var url = mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessIfTrue";
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var ret = JSON.parse(xhr.responseText);
				if (parseInt(ret.status) === 0) {
					if (ret.data.length > 0) {
						if (
							ret.data[0].two_tag_id != undefined &&
							ret.data[0].two_tag_id != '' &&
							ret.data[0].two_tag_id != null) {
							document.getElementsByName('business_tag')[0].value = ret.data[0].two_tag_id;
							document.getElementById('business_tag').setAttribute('value', one_tag_name + ret.data[0].name);
							document.getElementById('business_tag').setAttribute('data-value', ret.data[0].name);
						}
					}
				}
			}
		}
		xhr.open('POST', url);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send('business_id=' + storage['business_id']);
	}

	function initLabelValue(type, id) {
		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var retJson = JSON.parse(xhr.responseText);
				var strArr = [];
				if (retJson.status == 0) {
					retJson.data.forEach(function(ret) {
						strArr.push(ret.name);
					})
					if (type == 0) {
						document.getElementById('teseContent').setAttribute('value', strArr.toString());
						document.getElementById('teseContent').setAttribute('data-value', strArr.toString());
					} else if (type == 1) {
						document.getElementById('fuwuContent').setAttribute('value', strArr.toString());
						document.getElementById('fuwuContent').setAttribute('data-value', strArr.toString());
					} else {

					}
				}
			}
		}
		xhr.open('POST', mMain.url + '/wnk_business_app/v1.0.0/selectLabel', true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send('business_id=' + storage["business_id"] + '&type=' + type + "&id=" + id);
	}

	/**
	 * 保存用户已经选中的标签
	 */
	function saveBusinessTag() {
		var key = document.getElementsByName('business_tag')[0].value;
		var arr = new Map();
		arr[key] = true;
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/saveBusinessTag",
			type: "POST",
			dataType: 'json',
			data: {
				'business_id': storage["business_id"],
				'arr': _mapToJson(arr)
			},
			success: function(data) {
				toast(3, "关闭Loading");
				if (parseInt(data.status) === 0) {
					toast(1, data.msg);
					mMain.back();
				} else if (data.msg == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			},
		});
	}

	//修改店铺数据
	function setInformationData() {
		var name = document.getElementById("store_name").value;
		var address = document.getElementById("address").value;
		var mobile = document.getElementById("mobile").value;
		var store_describe = document.getElementById("store_describe").value;

		var photos = document.getElementsByClassName("phots");

		var hours = document.getElementById('hours').value;

		var lat = document.getElementById('lat').value;
		var longt = document.getElementById('longt').value;
		var pos = document.getElementById('pos').value;

		var area = document.getElementsByName('area')[0].value;
		var store_cover_photo = document.getElementById('store_cover_photo').src;
		var positive_price = document.getElementById('positive_price').value;

		if (store_cover_photo == undefined || store_cover_photo == '') {
			mui.toast('请上传展示图');
		} else if (name == "" || name == undefined) {
			mui.toast("请输入店铺名称");
		} else if (address == "" || address == undefined) {
			mui.toast("请输入店铺地址");
		} else if (positive_price == undefined || positive_price == "") {
			mui.toast("请输入店铺正价展示价格");
		} else if (positive_price <= 0.00) {
			mui.toast("正价展示价格不可小于等于0");
		} else if (lat == '' || lat == undefined || longt == '' || longt == undefined || pos == '' || pos == undefined) {
			mui.toast('请选择店铺位置');
		} else if (hours == '' || hours == undefined) {
			mui.toast('请选择营业时间');
		} else if (area == '' || area == undefined) {
			mui.toast('请选择店铺区域');
		} else if (mobile == "" || mobile == undefined) {
			mui.toast("请输入店铺联系电话");
		} else if (store_describe == "" || store_describe == undefined) {
			mui.toast("请输入活动优惠");
		} else if (store_describe.length > 15) {
			mui.toast("活动优惠不可超过15字");
		} else if (photos.length <= 0) {
			mui.toast("请上传店铺滚动图");
		} else {

			// 获取滚动图 
			var photoIds = "";
			for (var index = 0; index < photos.length; index++) {
				var url = photos[index].src;
				var photoId = url.split("imageid=")[1];
				if (index != photos.length - 1) {
					photoIds = photoIds + photoId + ",";
				} else {
					photoIds = photoIds + photoId;
				}
			}

			toast(2, "打开loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/setStoreInformation",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"store_name": name,
					"address": address,
					"mobile": mobile,
					"store_describe": store_describe,
					"photo_ids": photoIds,
					'business_hours': hours,
					'lat': lat,
					'longt': longt,
					'position_name': pos,
					'area': area,
					'cover_photo': store_cover_photo,
					'positive_price': positive_price
				},
				success: function(data) {
					toast(3, "关闭loading");

					if (data.status == 0) {
						if (set_tag_state == 0) {
							saveBusinessTag();
						} else {
							toast(1, data.msg);
							mMain.back();
						}

					} else if (data.msg == 2) {
						mMain.gotoLogin();
					} else {
						//						mui.toast(data.msg);
					}
				},
			});

		}
	}

	function chooseHeaderChangeFile() {

		var pl = $('#lunbo_photo_ul > li');
		if (pl.length > 2) {
			mui.alert("最多上传三张", "猛戳商家版");
			return;
		}

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
				if (data.error == 0) {
					currentPhotoIndex++;
					var html = "<li id=\"photo" + currentPhotoIndex + "\">" +
						"<img src=\"" + data.url_location + "\" class=\"photo_img\"/>" +
						"<img src=\"../../static/images/wnk_business/delete_icon.png\" class=\"delete_button\" name=\"" +
						currentPhotoIndex + "\"/>" +
						"</li>";

					html = '' +
						'<li id="photo' + currentPhotoIndex + '" class="weui-uploader__file">' +
						'	<img src="' + data.url_location + '" class="phots"/>' +
						'	<span class="mui-badge mui-badge-red myBadgeposition" name="' + currentPhotoIndex + '">x</span>' +
						'</li>';

					$("#lunbo_photo_ul").append(html);
				} else {
					toast(1, data.message);
				}
				$('#header_file').change(chooseHeaderChangeFile);
			},
			error: function(data, status, e) {
				toast(3, "关闭loading");
				$('#header_file').change(chooseHeaderChangeFile);
			}
		});
	}

	function okPos(adders_param, latitude_param, longitude_param) {
		document.getElementById('pos').value = adders_param;
		document.getElementById('lat').value = latitude_param;
		document.getElementById('longt').value = longitude_param;
	}

	function _strMapToObj(strMap) {
		let obj = Object.create(null);
		for (var keys in strMap) {
			obj[keys] = strMap[keys]
		}
		return obj;
	}
	// map转换为json
	function _mapToJson(map) {
		return JSON.stringify(_strMapToObj(map));
	}

});
