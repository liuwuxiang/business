var recommend_qr_code = "";
var pay_qr_code = "";
var storage = null;

mui.init();
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;

		listOptionInit(0);

		var self = plus.webview.currentWebview();
		if (self.type != undefined && String(self.type) !== '') {
			listOptionInit(1);
		}

		// 物料购买
		mui('#business_type_ul').on('tap', 'li', function() {
			var materiel_name = this.getAttribute('name');
			var materiel_id = this.getAttribute('id');
			mui.openWindow({
				url: "./buy_materiel_meal.html",
				id: "buy_materiel_meal.html",
				extras: {
					"materiel_name": materiel_name,
					"materiel_id": materiel_id
				},
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNew: true,
			});

		})

		// 物料赠送
		mui('.addhouse').on('tap', 'a', function() {
			mui.openWindow({
				url: "./materiel_send_to_user.html",
				id: "materiel_send_to_user.html",
				extras: {},
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNew: true,
			});

		})

		document.getElementById('fenxiang').addEventListener('tap', weiboClick);

	});

});

function weiboClick() {
	console.log($('#qr_code_img').attr('src'));
	var down = plus.downloader.createDownload($('#qr_code_img').attr('src'), {
		method: 'GET',
		filename: '_documents/1.jpg',
		priority: '99',
	}, function(download, status) {
		// plus.io.convertLocalFileSystemURL(download.filename) 把下载下来的文件转换为平台绝对路径
		$('#qr_code_img').attr('src', 'file://' + plus.io.convertLocalFileSystemURL(download.filename));
		plus.share.sendWithSystem({
			type: "image",
			pictures: [ plus.io.convertLocalFileSystemURL(download.filename)],
			thumbs: [ plus.io.convertLocalFileSystemURL(download.filename)],
		}, null, null);
	});
	down.start();
}

/*
 *	列表项初始化
 * type=0:推广物料,type=1：我的物料,type=2：二维码
 * */
function listOptionInit(type) {
	if (type == 0) {
		document.getElementById("extension_materiel").setAttribute("class", "item sel");
		document.getElementById("my_materiel").setAttribute("class", "item");
		document.getElementById("qr_code").setAttribute("class", "item");
		document.getElementById("extension_materiel_div").style.display = "block";
		document.getElementById("my_materiel_div").style.display = "none";
		document.getElementById("qr_code_div").style.display = "none";
		getAllExtensionMateriel();
	} else if (type == 1) {
		document.getElementById("extension_materiel").setAttribute("class", "item");
		document.getElementById("my_materiel").setAttribute("class", "item sel");
		document.getElementById("qr_code").setAttribute("class", "item");
		document.getElementById("extension_materiel_div").style.display = "none";
		document.getElementById("my_materiel_div").style.display = "block";
		document.getElementById("qr_code_div").style.display = "none";
		getAllExtensionMaterielByBusinessId();
	} else if (type == 2) {
		document.getElementById("extension_materiel").setAttribute("class", "item");
		document.getElementById("my_materiel").setAttribute("class", "item");
		document.getElementById("qr_code").setAttribute("class", "item sel");
		document.getElementById("extension_materiel_div").style.display = "none";
		document.getElementById("my_materiel_div").style.display = "none";
		document.getElementById("qr_code_div").style.display = "block";
		listOptionInitQrCode(0);
	}
}

/*
 *	列表项初始化
 * type=0:推广二维码，type=1：收款二维码
 * */
function listOptionInitQrCode(type) {
	if (type == 0) {
		document.getElementById("recommend_qr_code").setAttribute("class", "item sel");
		document.getElementById("pay_qr_code").setAttribute("class", "item");
		document.getElementById('share').style.display = 'inline';
		getBusinessBaseInformation(0);
	} else if (type == 1) {
		document.getElementById("recommend_qr_code").setAttribute("class", "item");
		document.getElementById("pay_qr_code").setAttribute("class", "item sel");
		document.getElementById('share').style.display = 'inline';
		getBusinessBaseInformation(1);
	}
}

//获取推广物料
function getAllExtensionMateriel() {
	toast(2, "打开loading");
	$("#business_type_ul li").remove();
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getAllExtensionMateriel",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			if (data.status == 0) {
				toast(3, data.msg);
				var list = data.data;
				for (var index = 0; index < list.length; index++) {
					var obj = list[index];
					var html = "<li class=\"business_type_ul_li\" id = \"" + obj.id + "\" name = \"" + obj.name + "\">" +
						"<div class=\"business_type_li_div\">" +
						"<img src=\"" + obj.background_photo + "\" class=\"li_background_img\"/>" +
						"<div class=\"li_top_div\">" +
						"<img src=\"" + obj.logo_photo_id + "\"/>" +
						"<a>" + obj.name + "</a>" +
						"</div>" +
						"<a class=\"surplus_tip\">购买</a>" +
						"</div>" +
						"</li>";
					$("#business_type_ul").append(html);
				}
			} else if (data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
			}
		}
	});
}

//获取商家的推广物料
function getAllExtensionMaterielByBusinessId() {
	toast(2, "打开loading");
	$("#my_materiel_ul li").remove();
	publicnull_tip("暂无数据", 1);
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getAllExtensionMaterielByBusinessId",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {

			if (data.status == 0) {
				toast(3, data.msg);
				publicnull_tip("关闭提示", 0);
				var list = data.data;
				for (var index = 0; index < list.length; index++) {
					var obj = list[index];
					var html = "<li class=\"business_type_ul_li\" id = \"" + obj.id + "\">" +
						"<div class=\"business_type_li_div\">" +
						"<img src=\"" + obj.background_photo + "\" class=\"li_background_img\"/>" +
						"<div class=\"li_top_div\">" +
						"<img src=\"" + obj.logo_photo_id + "\"/>" +
						"<a>" + obj.materiel_name + "</a>" +
						"</div>" +
						"<a class=\"surplus_tip2\">剩余：" + obj.surplus_number + "</a>" +
						"</div>" +
						"</li>";
					$("#my_materiel_ul").append(html);
				}
			} else if (data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
				publicnull_tip(data.msg, 1);
			}
		}
	});
}

//获取商户基础信息(type=0:推广二维码，type=1：收款二维码)
function getBusinessBaseInformation(type) {
	toast(2, "打开loading");
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getStoreInformation",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {
			if (data.status == 0) {
				toast(3, data.msg);
				if (type == 0) {
					document.getElementById("qr_code_img").src = data.data.recommend_qr_code;
				} else {
					document.getElementById("qr_code_img").src = data.data.pay_qr_code;
				}

			} else if (data.status == 2) {
				mMain.gotoLogin();
			} else {
				mui.toast(data.msg);
			}
		}
	});
}

/*
 * 提示修改
 * */
function publicnull_tip(content, state) {
	var publicnull_tip = document.getElementById("publicnull_tip");
	if (state == 0) {
		publicnull_tip.style.display = "none";
	} else {
		document.getElementById("request_tip").innerText = content;
		publicnull_tip.style.display = "block";
	}
}
