// 本地存储
var storage           = null;
// 法人身份证正面
var id_card_facade    = null;
// 法人身份证背面
var id_card_rear      = null;
// 营业执照
var business_license  = null;
// 许可证
var license           = null;
// 法人联系电话
var phone             = null;

mui.init();

mui.plusReady(function() {
	mui.ready(function() {
		// 初始化绑定
		storage          = window.localStorage;
		id_card_facade   = document.getElementById('id_card_facade');
		id_card_rear     = document.getElementById('id_card_rear');
		business_license = document.getElementById('business_license');
		license          = document.getElementById('license');
		phone            = document.getElementById('phone');
		
		// 防止手机弹出输入法是tar跟着跑
 		plus.webview.currentWebview().setStyle({height:'d'});
		// 获取认证状态
		selectBusinessLegalize();
		// 绑定上传事件
		mui('.weui-uploader__bd').on('tap', '.weui-uploader__input-box', xuanze);
		// 绑定提交事件
		document.getElementById('addBusinessLegalize').addEventListener('tap', addBusinessLegalize);
	})
	
	var true_header_file = null;
	
	function xuanze(){
		true_header_file = this.getAttribute('id');
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

	/**
	 * 图片上传
	 */
	function imgUpload() {
		var file_name   = this.getAttribute("name");
		var header_file = this.getAttribute("id");
		var img_ul      = $('#' + header_file + '_ul');
		var file_div    = $('#' + header_file + '_div');
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajaxFileUpload({
			url: mMain.url + '/images/savaimageMobile.do',
			secureuri: false,
			fileElementId: header_file,
			dataType: 'json',
			type: 'post',
			data: {
				'fileNameStr': file_name,
				'fileId': header_file
			},
			success: function(data, status) {
				toast(3, "关闭loading");
				if (status === 'success') {
					img_ul.empty();
					img_ul.append('' +
						'<li class="weui-uploader__file" style="background-image:url(' + data.url_location + ')">' +
						'	<span id="' + header_file + '_img" class="mui-badge mui-badge-purple img-jiaobiao">x</span>' +
						'</li>' +
						'');
					// 把图片名称存放到div
					switch (header_file) {
						case 'header_file_1': // 法人身份证正面
							id_card_facade.value = data.url;
							break;
						case 'header_file_2': // 法人身份证背面
							id_card_rear.value = data.url;
							break;
						case 'header_file_3': // 营业执照
							business_license.value = data.url;
							break;
						case 'header_file_4': // 许可证
							license.value = data.url;
							break;
					}
					// 隐藏上传div
					file_div.css('display', 'none');
					// 绑定删除按钮点击事件
					document.getElementById(header_file + '_img').addEventListener('click', function() {
						// 删除对应的图片ID
						switch (header_file) {
							case 'header_file_1': // 法人身份证正面
								id_card_facade.value = '';
								break;
							case 'header_file_2': // 法人身份证背面
								id_card_rear.value = '';
								break;
							case 'header_file_3': // 营业执照
								business_license.value = '';
								break;
							case 'header_file_4': // 许可证
								license.value = '';
								break;
						}
						// 删除图片
						img_ul.empty();
						// 一定要延时 不然会再次打开上传界面
						setTimeout(function() {
							file_div.css('display', 'inline');
						}, 1);
					});
				} else {
					$.toast("上传出错", 'text');
				}
			}
		});
	}

	/**
	 * 提交按钮单击事件
	 */
	function addBusinessLegalize() {
		console.log('法人身份证正面:'+id_card_facade.value);
		console.log('法人身份证背面:'+id_card_rear.value);
		console.log('营业执照:'+business_license.value);
		console.log('许可证:'+license.value);
		if (phone.value == undefined || phone.value == '') {
			plus.nativeUI.toast("请输入法人联系方式");
			return;
		}
		if (id_card_facade.value == undefined || id_card_facade.value == '') {
			plus.nativeUI.toast("请上传法人身份证正面照片");
			return;
		}
		if (id_card_rear.value == undefined || id_card_rear.value == '') {
			plus.nativeUI.toast("请上传法人身份证背面照片");
			return;
		}
		if (business_license.value == undefined || business_license.value == '') {
			plus.nativeUI.toast("请上传营业执照照片");
			return;
		}
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/addBusinessLegalize",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id"         : storage["business_id"],
				'id_card_facade_img'  : id_card_facade.value,
				'id_card_rear_img'    : id_card_rear.value,
				'business_license_img': business_license.value,
				'license_img'         : license.value,
				'phone'               : phone.value
			},
			success: function(data) {
				// console.log(JSON.stringify(data));
				if (data.status == 0) {
					mui.confirm('提交完成,请等待审核!', '猛戳商家版', ['确定'], function() {
						plus.runtime.quit();
						
					}, 'div');
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(1, data.msg);
				}
			}
		});
	}

	/**
	 * 获取商家认证状态
	 */
	function selectBusinessLegalize() {
		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessLegalize",
			type: "POST",
			dataType: 'json',
			data: {
				'business_id': storage['business_id']
			},
			success: function(data) {
				toast(3,"关闭loading");
				if (data.status == 0) {
					if (String(data.data.status) == '已认证') {
						mui.confirm('正在审核或已认证', '猛戳商家版', ['确定'], function() {
							mui.openWindow({
								url: '../my/my.html',
								id: 'my.html',
								styles: {
									top: '0px',
									bottom: '51px',
								},
								show: {
									aniShow: 'none', //页面显示动画，默认为”slide-in-right“；
								},
								waiting: {
									autoShow: true, //自动显示等待框，默认为true
								}
							});
						}, 'div');
					}
				} else if (data.status == 2) {
					mMain.gotoLogin();
				} else {
					toast(1, data.msg);
				}
			}
		});
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
		toast(2,"打开loding")
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
			var file_name   = 'ajaxFile';
			var header_file = true_header_file;
			var img_ul      = $('#' + header_file + '_ul');
			var file_div    = $('#' + header_file);
		
			img_ul.empty();
					img_ul.append('' +
						'<li class="weui-uploader__file" style="background-image:url(' + data.data.src + ')">' +
						'	<span id="' + header_file + '_img" class="mui-badge mui-badge-purple img-jiaobiao">x</span>' +
						'</li>' +
						'');
					// 把图片名称存放到div
					switch (header_file) {
						case 'header_file_1': // 法人身份证正面
							id_card_facade.value = data.url;
							break;
						case 'header_file_2': // 法人身份证背面
							id_card_rear.value = data.url;
							break;
						case 'header_file_3': // 营业执照
							business_license.value = data.url;
							break;
						case 'header_file_4': // 许可证
							license.value = data.url;
							break;
					}
					// 隐藏上传div
					file_div.css('display', 'none');
					// 绑定删除按钮点击事件
					document.getElementById(header_file + '_img').addEventListener('click', function() {
						// 删除对应的图片ID
						switch (header_file) {
							case 'header_file_1': // 法人身份证正面
								id_card_facade.value = '';
								break;
							case 'header_file_2': // 法人身份证背面
								id_card_rear.value = '';
								break;
							case 'header_file_3': // 营业执照
								business_license.value = '';
								break;
							case 'header_file_4': // 许可证
								license.value = '';
								break;
						}
						// 删除图片
						img_ul.empty();
						// 一定要延时 不然会再次打开上传界面
						setTimeout(function() {
							file_div.css('display', 'inline');
						}, 1);
					});
		
			toast(3,"关闭lodding")
		} else {
			console.log("上传失败：" + JSON.stringify(t));
			mui.toast("图片上传失败");
			toast(3,"关闭lodding")
		}
	}


})
