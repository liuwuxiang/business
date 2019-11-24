"use strict"

mui.init();
mui.plusReady(function() {

	// 本地存储对象
	var storage = window.localStorage;

	// 最小宽度
	var minWidth = -1;
	// 最小高度
	var minHeight = -1;

	// 图片剪裁对象
	var cropper = null;

	mui.ready(function() {
		// 获取手机屏幕高度
		var phoneHeight = plus.screen.resolutionHeight;
		// 获取当前1rem等于多少px 然后计算顶部高度
		var headHeight = parseInt(document.documentElement.clientHeight / 7.5 * 0.88);
		// 给扫描框设置高度 屏幕高度-底部高度-顶部高度
		document.getElementById('barcode').style.height = (phoneHeight - 47 - headHeight) + 'px';

		// 获取需要的最小宽高
		var value = plus.webview.currentWebview();
		minWidth  = value.winth;
		minHeight = value.height;

		document.getElementById('image').src = value.path;

		// 获取img对象
		var image = document.getElementsByTagName('img').item(0);
		// 初始化剪裁层
		cropper = new Cropper(image, {
			aspectRatio: minWidth / minHeight,
			cropBoxResizable: false,
			dragMode: 'none',
			preview: ".small",
			restore: false,
			minCropBoxWidth: minWidth,
			minCropBoxHeight: minHeight,
			viewMode: 1,
		});

		// 绑定确定事件
		document.getElementById('ok').addEventListener('click', ok);

	});

	function ok() {
		toast(2,'打开loading');
		
		var cas = cropper.getCroppedCanvas();
		var base64url = cas.toDataURL('image/png');
		cas.toBlob(function(blob){
			const formData = new FormData();
			formData.append('file', blob);
			$.ajax({
			    url: mMain.url + '/images/saveImageByPlus',
			    data: formData,
			    type:"POST",
			    contentType:false,
			    processData:false,
			    success:function(data){
			    	toast(3,'关闭loading');
			    	data = JSON.parse(data);
			    	var view = plus.webview.all();
					console.log(1);
					mui.fire(view[view.length - 2],'uploadImg',{
						'src'  :data.data.src,
						'title':data.data.title
					});
					// 关闭当前页面
					plus.webview.close(plus.webview.getTopWebview().id, 'slide-out-right');
			    },
			});
		},"image/jpeg", 0.8);
		cropper.clear();
	}

	//上传图片
	function uploadHead(imgPath) {
		$.ajax({
			type: "POST",
			url: mMain.url + '/images/saveImageByBase64',
			data: {
				file: imgPath
			}, 
			success: function(data) {
				data = JSON.parse(data);
				if(parseInt(data.code) === 0){
					var view = plus.webview.all();
					mui.fire(view[view.length - 2],'uploadImg',{
						'src':data.data.src,
						'title':data.data.title
					});
					// 关闭当前页面
					plus.webview.close(plus.webview.getTopWebview().id, 'slide-out-right');
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("上传失败，请检查网络后重试");
			}
		});  

	}
});