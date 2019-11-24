var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	var id = null;

	mui.ready(function() {

		storage = window.localStorage;

		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});

		var self = plus.webview.currentWebview();
		id = self.type_id;

		if (id !== undefined && String(id) !== '') {
			init(id);
		}

		document.getElementById('addIntegralType').addEventListener('tap', addIntegralType);
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

		});

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
			$('input[name=img]').val(data.data.title);
			uploaderFiles.empty();
			console.log(JSON.stringify(data));
			var html = '' +
				'<li class="weui-uploader__file" name="uploaderFiles"  data-name="' + data.data.title + '" >' +
				'	<img src="' + data.data.src + '"/>' +
				'	<span id="uploaderFiles_li" class="mui-badge mui-badge-red myBadgeposition">x</span>' +
				'</li>';
			uploaderFiles.append(html);

			$('#fileUpload').css('display', 'none');
			document.getElementById('uploaderFiles_li').addEventListener('click', function() {
				console.log(1);
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
	 * 保存或者新增分类
	 */
	function addIntegralType() {
		// 获取参数
		var type_id = id;
		// 分类图片
		var img = $('input[name=img]').val();
		// 分类名称
		var name = $('#name').val();
		// 是否启用
		var isChecked = $('#isChecked').is(':checked') ? 0 : 1;
		// 请求地址
		var url = null;
		// 提示消息
		var msgTest = null;
		// 参数检查
		if (img === undefined || img === null || img === '') {
			$.toast("请上传分类图片", 'text');
			return;
		}
		if (img === undefined || name === null || name === '') {
			$.toast("请输入分类名称", 'text');
			return;
		}
		if (id === undefined || id === null || id === '') {
			msgTest = "新增分类中";
			url = mMain.url + "/wnk_business/addWnkIntegralType";
		} else {
			msgTest = "修改分类中";
			url = mMain.url + "/wnk_business/editWnkIntegralType";
		}

		$.showLoading(msgTest);
		jQuery.support.cors = true;
		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			timeout: 5000,
			data: {
				'business_id': storage['business_id'],
				'id': type_id,
				"img": img,
				'name': name,
				'is_checked': isChecked
			},
			success: function(data) {
				if (parseInt(data.status) === 0) {
					$.hideLoading();
					mui.alert(data.msg, '猛戳商家版', null, function() {
						mMain.back();
					},'div');
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			}
		});
	}

	/**
	 * 页面初始化
	 */
	function init(type_id) {
		$.showLoading("正在处理中...");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business/getIntegralTypeById',
			type: 'post',
			dataType: 'json',
			timeout: 5000,
			data: {
				'business_id': storage['business_id'],
				'id': type_id
			},
			success: function(data) {
				$.hideLoading();
				if (parseInt(data.status) === 0) {

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

					$('input[name=img]').val(data.data.img);

					if (parseInt(data.data.is_checked) === 0) {
						$('#isChecked').attr('checked', 'checked');
					} else {
						$('#isChecked').removeAttr('checked', 'checked');
					}

				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			}
		});

	}

});
