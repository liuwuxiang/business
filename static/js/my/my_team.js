var storage = null;
mui.init();
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;

		document.getElementById('back').addEventListener('tap', mMain.back);
		getBusinessBaseInformation();
		listOptionInit(0);

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			getBusinessBaseInformation();
		});

	});

	//获取商户基础信息
	function getBusinessBaseInformation() {
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

				if(data.status == 0) {
					toast(3, data.msg);
					document.getElementById("header_img").src = data.data.header;
					document.getElementById("ewm_header").src = data.data.header;
					document.getElementById("nick_name").innerHTML = data.data.name;
					document.getElementById("ewm_name").innerHTML = data.data.name;
					document.getElementById("ewm_tel").innerHTML = data.data.mobile;
					document.getElementById("level_name").innerHTML = data.data.business_level_name;
					document.getElementById("recommend_qr_code").src = data.data.recommend_qr_code;

				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			}
		});
	}

});

/*
 *	列表项初始化
 * type=0:我的会员，type=1：我的商户
 * */
function listOptionInit(type) {
	if(type == 0) {
		document.getElementById("my_member_option").setAttribute("class", "item sel");
		document.getElementById("my_business_option").setAttribute("class", "item");
		getBusinessExtensionMember();
	} else if(type == 1) {
		document.getElementById("my_member_option").setAttribute("class", "item");
		document.getElementById("my_business_option").setAttribute("class", "item sel");
		getBusinessExtensionBusiness();
	} 
}

//获取商家推广的用户
function getBusinessExtensionMember() {
	toast(2, "打开loading");
	$("#teamlist li").remove();
	publicnull_tip("暂无数据", 1);
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getBusinessExtensionMember",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {

			if(data.status == 0) {
				toast(3, data.msg);
				publicnull_tip("关闭提示", 0);
				var list = data.data;
				for(var index = 0; index < list.length; index++) {
					var obj = list[index];
					var html = "<li>" +
						"<div class=\"item\">" +
						"<div class=\"left\">" +
						"<img src=\"" + obj.header + "\" alt=\"\" class=\"img\">" +
						"<span class=\"name\">" + obj.nick_name + "</span>" +
						"<p class=\"lev\">" + obj.member_star + "星级" + obj.level_name + obj.card_name + "</p>" +
						"</div>" +
						"<div class=\"right\">" +
						"<p class=\"tel\">" + obj.mobile + "</p>" +
						"<p class=\"time\">" + obj.register_time_str + "</p>" +
						"</div>" +
						"</div>" +
						"</li>";
					$("#teamlist").append(html);
				}
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
				publicnull_tip(data.msg, 1);
			}
		}
	});
}

//获取商家推广的商家
function getBusinessExtensionBusiness() {
	toast(2, "打开loading");
	$("#teamlist li").remove();
	publicnull_tip("暂无数据", 1);
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getBusinessExtensionBusiness",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"]
		},
		success: function(data) {

			if(data.status == 0) {
				toast(3, data.msg);
				publicnull_tip("关闭提示", 0);
				var list = data.data;
				for(var index = 0; index < list.length; index++) {
					var obj = list[index];
					var html = "<li>" +
						"<div class=\"item\">" +
						"<div class=\"left\">" +
						"<img src=\"" + obj.header + "\" alt=\"\" class=\"img\">" +
						"<span class=\"name\">" + obj.store_name + "</span>" +
						"<p class=\"lev\">" + obj.level_name + "</p>" +
						"</div>" +
						"<div class=\"right\">" +
						"<p class=\"tel\">" + obj.contact_mobile + "</p>" +
						"<p class=\"time\">" + obj.join_time + "</p>" +
						"</div>" +
						"</div>" +
						"</li>";
					$("#teamlist").append(html);
				}
			} else if(data.status == 2) {
				mMain.gotoLogin();
			} else {
				toast(1, data.msg);
				publicnull_tip(data.msg, 1);
			}
		}
	});
}


/*
 * 提示修改
 * */
function publicnull_tip(content, state) {
	var publicnull_tip = document.getElementById("publicnull_tip");
	if(state == 0) {
		publicnull_tip.style.display = "none";
	} else {
		document.getElementById("request_tip").innerText = content;
		publicnull_tip.style.display = "block";
	}
}