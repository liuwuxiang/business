var storage = window.localStorage;
var p; // 选择器对象
mui.init();
mui.plusReady(function() {
	// mui相关代码
	mui.ready(function() {
		// 绑定事件
		eventBinding();
		// 初始化显示
		var self = plus.webview.currentWebview();
		initView(self);
		initPicker();
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});
	});
});


var file_id_name = null;

/**
 * 事件绑定
 */
function eventBinding() {
//	$('#header_file1').change(function() {
//		imgUpload('header_file1');
//	})
//
//	$('#header_file2').change(function() {
//		imgUpload('header_file2');
//	})
//
//	$('#header_file3').change(function() {
//		imgUpload('header_file3');
//	})

	document.getElementById('header_file1').addEventListener('tap',function(){
		file_id_name = this.getAttribute('id');
		xuanze();
	});
	
	document.getElementById('header_file2').addEventListener('tap',function(){
		file_id_name = this.getAttribute('id');
		xuanze();
	});
	
	document.getElementById('header_file3').addEventListener('tap',function(){
		file_id_name = this.getAttribute('id');
		xuanze();
	});
	
	
	$('#addGalleryChangtu').click(addGalleryChangtu);
	$('#addGalleryLianjie').click(addGalleryLianjie);
	$('#addSystemMsg').click(addSystemMsg);
	$('#select1').click(function() {
		p.show(function(item) {
			$('#select1').val(item[0].text);
			$('#select1').attr('data-value', item[0].value);
		})
	});
	$('#select2').click(function() {
		p.show(function(item) {
			$('#select2').val(item[0].text);
			$('#select2').attr('data-value', item[0].value);
		})
	});
	$('#select3').click(function() {
		p.show(function(item) {
			$('#select3').val(item[0].text);
			$('#select3').attr('data-value', item[0].value);
		})
	});
}

function initView(param) {
	if(param.type == 0) {
		if(param.ad_type == 0) {
			$('#ad_gallery_div').css('display', 'inline');
			$('#ad_gallery_div2').css('display', 'none');
			$('#ad_systeme_msg_div').css('display', 'none');
		} else {
			$('#ad_gallery_div').css('display', 'none');
			$('#ad_gallery_div2').css('display', 'inline');
			$('#ad_systeme_msg_div').css('display', 'none');
		}
	} else {
		$('#ad_gallery_div').css('display', 'none');
		$('#ad_gallery_div2').css('display', 'none');
		$('#ad_systeme_msg_div').css('display', 'inline');
	}
}

function addGalleryChangtu() {
	var title = $('#title1').val();
	var receive_type = $('#select1').attr('data-value');
	if(title == undefined || title == '') {
		mui.toast("请输入活动标题");
		return;
	}
	if(receive_type == undefined || receive_type == '') {
		mui.toast("请选择接受对象");
		return;
	}
	if($('#uploaderFiles1 > li').length <= 0) {
		mui.toast("请上传活动轮播图");
		return;
	}
	if($('#uploaderFiles2 > li').length <= 0) {
		mui.toast("请上产活动长图");
		return;
	}
	var gallery_img = $('#uploaderFiles1 > li')[0].getAttribute('data-name');
	var gallery_content_img = $('#uploaderFiles2 > li')[0].getAttribute('data-name');

	$.showLoading("数据加载中");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/insertDoingsSpread',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			'type': '0',
			"business_id": storage["business_id"],
			'ad_type': '0',
			'gallery_type': '1',
			'title': title,
			'gallery_img': gallery_img,
			'gallery_content_img': gallery_content_img,
			'receive_type': receive_type
		},
		success: function(data) {
			$.hideLoading();
			if(data.status == 0) {
				mui.alert("新建活动成功,等待审核中!", "猛戳商家版", ['确定'], function() {
					mMain.back();
				}, 'div');
			} else {
				mui.alert(data.msg, "猛戳商家版", ['确定'], null, 'div');
			}
		},
		error: function() {
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			$.toast("数据加载失败", "text");
		}
	});
}

function addGalleryLianjie() {
	var title = $('#title2').val();
	var receive_type = $('#select2').attr('data-value');
	if(title == undefined || title == '') {
		mui.toast("请输入活动标题");
		return;
	}
	if(receive_type == undefined || receive_type == '') {
		mui.toast("请选择接受对象");
		return;
	}
	if(receive_type == undefined || receive_type == '') {
		mui.toast("请选择接受对象");
		return;
	}
	if($('#uploaderFiles3 > li').length <= 0) {
		mui.toast("请上传活动轮播图");
		return;
	}
	var gallery_img = $('#uploaderFiles3 > li')[0].getAttribute('data-name');
	$.showLoading("数据加载中");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/insertDoingsSpread',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"],
			'ad_type': '0',
			'gallery_type': '0',
			'title': title,
			'gallery_img': gallery_img,
			'type': '1',
			'receive_type': receive_type
		},
		success: function(data) {
			$.hideLoading();
			if(data.status == 0) {
				mui.alert("新建活动成功,等待审核中!", "猛戳商家版", ['确定'], function() {
					mMain.back();
				}, 'div');
			} else {
				mui.alert(data.msg, "猛戳商家版", ['确定'], null, 'div');
			}
		},
		error: function() {
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			$.toast("数据加载失败", "text");
		}
	});
}

function addSystemMsg() {
	var title = $('#title3').val();
	var receive_type = $('#select3').attr('data-value');
	var system_msg = $('#detail').val();
	if(title == undefined || title == '') {
		mui.toast("请输入活动标题");
		return;
	}
	if(system_msg == undefined || system_msg == '') {
		mui.toast("请输入活动内容");
		return;
	}

	$.showLoading("数据加载中");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + '/wnk_business_app/v1.0.0/insertDoingsSpread',
		type: "post",
		dataType: 'json',
		timeout: 5000,
		data: {
			"business_id": storage["business_id"],
			'ad_type': '1',
			'system_msg': system_msg,
			'title': title,
			'type': '2',
			'receive_type': receive_type
		},
		success: function(data) {
			$.hideLoading();
			if(data.status == 0) {
				mui.alert("新建活动成功,等待审核中!", "猛戳商家版", ['确定'], function() {
					mMain.back();
				}, 'div');
			} else {
				mui.alert(data.msg, "猛戳商家版", ['确定'], null, 'div');
			}
		},
		error: function(a, b, c) {
			console.log(a);
			console.log(b);
			console.log(c);
			// 关闭加载中的Loading层
			$.hideLoading();
			// 打开数据加载失败的toast
			mui.toast("数据加载失败", null, 'div');
		}
	});
}

// 三个图片上传事件
/**
 * 文件上传
 */
function imgUpload(fileId_name) {

	var uploaderFiles = null;
	var uploaderFilesId = "";
	if(fileId_name == 'header_file1') {
		uploaderFiles = $('#uploaderFiles1');
		uploaderFilesId = "uploaderFiles1";
	} else if(fileId_name == 'header_file2') {
		uploaderFiles = $('#uploaderFiles2');
		uploaderFilesId = "uploaderFiles2";
	} else {
		uploaderFiles = $('#uploaderFiles3');
		uploaderFilesId = "uploaderFiles3";
	}
	$.showLoading("图片上传中");
	jQuery.support.cors = true;
	$.ajaxFileUpload({
		url: mMain.url + '/images/savaimageMobile.do',
		secureuri: false,
		fileElementId: fileId_name,
		dataType: 'json',
		type: 'post',
		data: {
			'fileNameStr': 'ajaxFile',
			'fileId': String(fileId_name)
		},
		success: function(data, status) {
			$.hideLoading();
			if(status === 'success') {
				uploaderFiles.empty();

				var html = '' +
					'<li class="weui-uploader__file" style="background-image:url(' + data.url_location + ')" name="uploaderFiles"  data-name="' + data.url + '" >' +
					'<a id="' + fileId_name + '_img" class="mui-badge mui-badge-purple img-jiaobiao"><img src="../../static/images/wnk_business/delete%20(2).png" alt=""></a>' +
					'</li>';

				uploaderFiles.append(html);
				$('#' + fileId_name + '_div').css('display', 'none');
				document.getElementById(fileId_name + '_img').addEventListener('click', function() {
					$("#" + uploaderFilesId + " li").remove();
					setTimeout(function() {
						$('#' + fileId_name + '_div').css('display', 'inline');
						mui('.weui-uploader__input-box').off('change', '.weui-uploader__input-box');
						initImgUpload();
					}, 1);
				});
			} else {
				$.toast("上传出错", 'text');
			}
		},

	});
}

function initImgUpload() {
	mui('.weui-uploader__input-box').on('change', '.weui-uploader__input', function() {
		imgUpload(this.getAttribute('id'));
	})
}

/**
 * 初始化选择器
 */
function initPicker() {
	p = new mui.PopPicker();
	p.setData([{
		value: "0",
		text: "所有商家和用户"
	}, {
		value: "1",
		text: "所有商家"
	}, {
		value: "2",
		text: "所有用户"
	}, {
		value: "3",
		text: "我的会员"
	}, {
		value: "4",
		text: "我的商家"
	}])

}

function xuanze(){
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
	if(status == 200) {
		var data = JSON.parse(t.responseText);
		
		var uploaderFiles = null;
		var uploaderFilesId = "";
		if(file_id_name == 'header_file1') {
			uploaderFiles = $('#uploaderFiles1');
			uploaderFilesId = "uploaderFiles1";
		} else if(file_id_name == 'header_file2') {
			uploaderFiles = $('#uploaderFiles2');
			uploaderFilesId = "uploaderFiles2";
		} else {
			uploaderFiles = $('#uploaderFiles3');
			uploaderFilesId = "uploaderFiles3";
		}
		
		uploaderFiles.empty();
				var html = '' +
					'<li class="weui-uploader__file" style="background-image:url(' + data.data.src + ')" name="uploaderFiles"  data-name="' + data.data.title + '" >' +
					'<a id="' + file_id_name + '_img" class="mui-badge mui-badge-purple img-jiaobiao"><img src="../../static/images/wnk_business/delete%20(2).png" alt=""></a>' +
					'</li>';

				uploaderFiles.append(html);
				$('#' + file_id_name).css('display', 'none');
				document.getElementById(file_id_name + '_img').addEventListener('click', function() {
					$("#" + uploaderFilesId + " li").remove();
					setTimeout(function() {
						$('#' + file_id_name).css('display', 'inline');
						mui('.weui-uploader__input-box').off('change', '.weui-uploader__input-box');
						initImgUpload();
					}, 1); 
				}); 
		
		toast(3, "关闭lodding")
	} else {
		console.log("上传失败：" + JSON.stringify(t));
		mui.toast("图片上传失败");
		toast(3, "关闭lodding")
	}
}