var storage = window.localStorage;
var search_content = "";

mui.init();
//注意：若为ajax请求，则需将如下代码放在处理完ajax响应数据之后；
mui.plusReady(function() {
	mui.ready(function() {
		var self = plus.webview.currentWebview();
		search_content = self.search_content; //获得参数
		console.log("内容：" + search_content);
		//模糊查询会员
		function fuzzyQueryMember() {
			$("#member_list_ul li").remove();
			jQuery.support.cors = true;
			$.ajax({
				url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessVipSearch",
				type: "POST",
				dataType: 'json',
				data: {
					"business_id": storage["business_id"],
					"content": search_content,
				},
				success: function(data) {
					console.log(JSON.stringify(data));
					toast(3, "关闭loading");
					if(parseInt(data.status) === 0) {
						if(data.data != null && data.data.length > 0){
							publicnull_tip(data.msg, 0);
							var list = data.data;
							for(var index = 0; index < list.length; index++) {
								var obj = list[index];
								var sex = obj.sex == 0 ? "memberSexWoman" : obj.sex == 1? 'memberSexMale' : 'memberSexUnknown';
								var html =
									"<li class=\"member_list_li\">" +
									"<img id=\"member_list_head\" src=\""+obj.img_path+obj.header+"\" />" +
									"<div class=\"member_list_info\">" +
									"<div class=\"member_list_base_info\">" +
									"<p id=\"member_name\" class=\"member_name\">"+obj.nick_name+"</p>" +
									"<img id=\"member_sex\" class=\"member_sex\" src=\"../../static/images/wnk_business/"+sex+".png\" />" +
									"<p id=\"member_phone\" class=\"member_phone\">"+obj.mobile+"</p>" +
									"</div>" +
									"<p class=\"member_num_fitness\">健身次数：<span id=\"member_num_fitness\">"+obj.cishu+"</span>次</p>" +
									"<p class=\"member_days_remaining\">剩余天数：<span id=\"member_days_remaining\">"+obj.left_time+"</span>天</p>" +
									"</div>" +
									"</li>";
								$("#member_list_ul").append(html);
							}
						} else {
							 publicnull_tip(data.msg, 1);
						}
					} else {
						publicnull_tip("未搜索到数据", 1);
					}
					
				}
			});
		}

		fuzzyQueryMember();
	})
})

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