var storage = null;
var index = 0;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	storage = window.localStorage;
	mui.ready(function() {
		//		document.getElementById("header_file").addEventListener('change', chooseHeaderChangeFile)

		document.getElementById('floadimgbut').addEventListener('tap', xuanze);

		document.getElementById('feedback').addEventListener('tap', feedback);
	});
	// 防止手机弹出输入法是tar跟着跑
	plus.webview.currentWebview().setStyle({
		height: 'd'
	});

	var uploadImageId = "";

	//	/*
	//	 *	图像选择事件
	//	 * */
	//	function imgChoose() {
	//		document.getElementById("header_file").click();
	//	}

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
			success: function(data, status) {
				toast(3, "关闭loading");
				if (data.error == 0) {
					uploadImageId = uploadImageId + "," + data.url;
					setPhoto(data.url_location);
				} else {
					toast(1, data.message);
				}
			},
			error: function(data, status, e) {
				toast(3, "关闭loading");
				mui.alert(e, '猛戳商家版', ['确定']);
			}
		});
	}

	//设置图片
	function setPhoto(photo_url) {
		
		var html = "<p class=\"loadimgitem\"><img src=\"" + photo_url + "\" alt=\"\"><span class=\"delte\"></span></p>";
		var buttonHtml = "<label class=\"floadimgbut\" id=\"floadimgbut\"></label>";
		
		$("#floadimgbut").remove();
		$("#fuploadimg").append(html);
		$("#fuploadimg").append(buttonHtml);
		document.getElementById("floadimgbut").addEventListener('tap', xuanze);
	}

	//建议反馈
	function feedback() {
		var ftextarea = document.getElementById("ftextarea").value;
		if (ftextarea == undefined || ftextarea == "") {
			mui.toast("请填写反馈内容");
		} else {
			toast(2, "开启loading");
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/userFeedBack",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"content": ftextarea,
					"photos": uploadImageId
				},
				success: function(data) {
					toast(3, "关闭loading");
					if (data.status == 0) {
						mui.alert('反馈建议提交成功', '猛戳商家版', function() {
							mMain.back();
						});
					} else if (data.msg == 1) {
						mMain.gotoLogin();
					} else {
						mui.toast(data.msg);
					}
				},
			});
		}

	}


	function xuanze() {
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
	}

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
			uploadImageId = uploadImageId + "," + data.url;
			setPhoto(data.data.src);
			toast(3, "关闭lodding")
		} else {
			console.log("上传失败：" + JSON.stringify(t));
			mui.toast("图片上传失败");
			toast(3, "关闭lodding")
		}
	}


});
