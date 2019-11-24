var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	/**商品ID**/
	var id = null;

	mui.ready(function() {

		storage = window.localStorage;

		var self = plus.webview.currentWebview();
		id = self.goods_id;
		if (id !== undefined && String(id) !== '') {
			getGoodsInfo(id);
		}

		document.getElementById('type_btn').addEventListener('tap', getGoodsType);
		document.getElementById('addIntegralGoods').addEventListener('tap', addIntegralGoods);
		document.getElementById('fileUpload').addEventListener('tap', function() {
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
							getImage(); /*拍照*/
							break;
						case 2:
							galleryImg(); /*打开相册*/
							break;
					}
				})
			}
		})
	});

	//拍照 
	function getImage() {
		plus.camera.getCamera().captureImage(function(p) {
			uploadHead(p);
		});
	}
	//本地相册选择 
	function galleryImg() {
		plus.gallery.pick(function(p) {
			uploadHead(p);
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
		if (status == 200) {
			var data = JSON.parse(t.responseText);
			var uploaderFiles = $('#uploaderFiles');
			$('#img').val(data.data.title);
			uploaderFiles.empty();
			var html = '' +
				'<li class="weui-uploader__file" name="uploaderFiles"  data-name="' + data.data.title + '" >' +
				'	<img src="' + data.data.src + '"/>' +
				'	<span id="uploaderFiles_li" class="mui-badge mui-badge-red myBadgeposition">x</span>' +
				'</li>';
			uploaderFiles.append(html);
			$('#fileUpload').css('display', 'none');

			document.getElementById('uploaderFiles_li').addEventListener('click', function() {
				$("#uploaderFiles").empty();
				setTimeout(function() {
					$('#fileUpload').css('display', 'inline');
				}, 1);
			});

			toast(3, "关闭lodding")
		} else {
			console.log("上传失败：" + JSON.stringify(t));
			mui.toast("图片上传失败");
			toast(3, "关闭lodding")
		}
	}

	/**
	 * 获取商品详情
	 */
	function getGoodsInfo(goods_id) {
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business/getIntegralGoodsById',
			type: 'post',
			dataType: 'json',
			timeout: 5000,
			beforeSend: function(request) {
				$.showLoading("正在处理中...");
			},
			data: {
				'business_id': storage['business_id'],
				'id': goods_id
			},
			success: function(data) {
				$.hideLoading();
				if (parseInt(data.status) === 0) {
					$('#detail').val(data.data.detail);
					$('#img').val(data.data.img);

					var html = '' +
						'<li class="weui-uploader__file" name="uploaderFiles"  data-name="' + data.data.img + '" >' +
						'	<img src="' + data.data.urlPath + data.data.img + '"/>' +
						'	<span id="uploaderFiles_li" class="mui-badge mui-badge-red myBadgeposition">x</span>' +
						'</li>';

					$('#uploaderFiles').append(html);
					$('#fileUpload').css('display', 'none');

					document.getElementById('uploaderFiles_li').addEventListener('click', function() {
						$("#uploaderFiles").empty();
						setTimeout(function() {
							$('#fileUpload').css('display', 'inline');
						}, 1);
					});

					$('#name').val(data.data.name);
					$('#price').val(data.data.price);
					$('#synopsis').val(data.data.synopsis);
					if (parseInt(data.data.is_checked) === 0) {
						$('#is_checked').attr('checked', 'checked');
					} else {
						$('#is_checked').removeAttr('checked', 'checked');
					}
					$('input[name=type]').val(data.data.typeName);
					$('#type').val(data.data.type);
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			}
		});

	}

	/**
	 * 添加商品
	 */
	function addIntegralGoods() {
		// 获取参数
		var goods_id = id;
		var name = $('#name').val();
		var img = $('#img').val();
		var synopsis = $('#synopsis').val();
		var price = $('#price').val();
		var is_checked = $('#is_checked').is(':checked') ? 0 : 1;
		var type = $('#type').val();
		var detail = $('#detail').val();

		// 请求地址
		var url = null;

		if (String(name) === undefined || String(name) === null || String(name) === '') {
			$.toast("请输入商品名称", 'cancel');
			return;
		}
		if (String(img) === undefined || String(img) === null || String(img) === '') {
			$.toast("请上传商品大图", 'cancel');
			return;
		}
		if (String(synopsis) === undefined || String(synopsis) === null || String(synopsis) === '') {
			$.toast("请输入商品简介", 'cancel');
			return;
		}
		if (String(price) === undefined || String(price) === null || String(price) === '') {
			$.toast("请输入商品价格", 'cancel');
			return;
		}
		if (String(is_checked) === undefined || String(is_checked) === null || String(is_checked) === '') {
			$.toast("请请选择是否启用", 'cancel');
			return;
		}
		if (String(type) === undefined || String(type) === null || String(type) === '') {
			$.toast("请选择商品分类", 'cancel');
			return;
		}
		if (String(detail) === undefined || String(detail) === null || String(detail) === '') {
			$.toast("请输入商品详情", 'cancel');
			return;
		}

		if (id === undefined || id === null || id === '') {
			url = mMain.url + '/wnk_business/addIntegralGoods';
		} else {
			url = mMain.url + '/wnk_business/editIntegralGoods';
		}
		$.showLoading("正在处理中...");
		jQuery.support.cors = true;
		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			timeout: 5000,
			data: {
				'business_id': storage['business_id'],
				'id': goods_id,
				"name": name,
				'img': img,
				'synopsis': synopsis,
				'price': price,
				"is_checked": is_checked,
				'type': type,
				'detail': detail
			},
			success: function(data) {
				$.hideLoading();
				if (parseInt(data.status) === 0) {
					mui.alert(data.msg, '猛戳商家版', null, function() {
						mMain.back();
					}, 'div');
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			}
		});
	}

	/**
	 * 获取已经启用的分类
	 */
	function getGoodsType() {
		$.showLoading("载入数据中...");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business/getIntegralTypeByTrueToGoods',
			type: 'post',
			dataType: 'json',
			timeout: 5000,
			data: {
				"business_id": storage["business_id"]
			},
			success: function(data) {
				$.hideLoading();
				if (data.status == 0) {
					if (data.data.length <= 0) {
						mui.alert("无商品分类,请先添加商品分类");
					} else {
						weui.picker(data.data, {
							onChange: function(result) {
								data.data.forEach(function(value) {
									if (parseInt(value.value) === parseInt(result)) {
										$('input[name=type]').val(value.label);
										$('#type').val(value.value);
									}
								})
							},
							defaultValue: [0]
						});
					}
				}

			}
		});
	}

	/**
	 * 文件上传
	 */
	function imgUpload() {
		var uploaderFiles = $('#uploaderFiles');
		$.showLoading("图片上传中");
		jQuery.support.cors = true;
		$.ajaxFileUpload({
			url: mMain.url + '/images/savaimageMobile.do',
			secureuri: false,
			fileElementId: 'header_file',
			dataType: 'json',
			type: 'post',
			data: {
				'fileNameStr': 'ajaxFile',
				'fileId': 'header_file'
			},
			success: function(data, status) {
				$.hideLoading();
				if (status === 'success') {
					$('#img').val(data.url);
					uploaderFiles.empty();
					var html = '' +
						'<li class="weui-uploader__file" style="background-image:url(' + data.url_location +
						')" name="uploaderFiles"  data-name="' + data.url + '" >' +
						'<a id="uploaderFiles_li" href="javascript:void(0);" class="mui-badge mui-badge-purple img-jiaobiao"><img src="../../static/images/wnk_business/delete%20(2).png" alt=""></a>' +
						'</li>';
					uploaderFiles.append(html);
					$('#fileUpload').css('display', 'none');
					document.getElementById('uploaderFiles_li').addEventListener('click', function() {
						$("#uploaderFiles").empty();
						setTimeout(function() {
							$('#fileUpload').css('display', 'inline');
							document.getElementById('header_file').addEventListener('change', imgUpload);
						}, 1);
					});
				} else {
					$.toast("上传出错", 'text');
				}
			}
		});
	}

})
