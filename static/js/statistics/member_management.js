var storage = window.localStorage;


//排序类型和id
var sort_type = 4;
var type_id = -1;

mui.init();

mui.plusReady(function() {
	mui.ready(function() {
		// 防止手机弹出输入法是tar跟着跑
		plus.webview.currentWebview().setStyle({
			height: 'd'
		});
		var searchIcon = document.getElementById("search_icon");
		var title = document.getElementById('title_tag');
		var searchBox = document.getElementById('search_box');

		sortMemberByConditions(sort_type, type_id);

		//顶部搜索按钮(点击后隐藏标题和搜索按钮，显示搜索框)
		document.getElementById("search_icon").addEventListener('click', function() {
			//隐藏标题和搜索按钮
			$('#search_icon').css('display', 'none');
			$('#title_tag').css('cssText', 'display:none !important');
			//显示搜索框(这种方法会覆盖元素原来的样式，如需保持需要在后面添加)
			$('#search_box').css('display', '');
			//			$('#search_box').css({
			//				'width': '65%',
			//				'margin-left': '15%'
			//			});
		});
		//按默认规则请求会员列表
		// sortMemberByConditions(sort_type, type_id);
		// 绑定搜索按钮事件
		mui('.head').on('click', '.searchsubmit', function() {
			var search_content = document.getElementById('search_content').value;
			if (search_content != undefined && search_content != "") {
				mui.openWindow({
					url: "./search.html",
					id: "search.html",
					extras: {
						search_content: search_content
					},
					styles: {
						top: '0px',
						bottom: '0px',
					},
					createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
					show: {
						autoShow: true, //页面loaded事件发生后自动显示，默认为true
						aniShow: 'slide-in-right', //页面显示动画，默认为”slide-in-right“；
						duration: '200' //页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
					},
					waiting: {
						autoShow: true, //自动显示等待框，默认为true
						title: '正在加载...', //等待对话框上显示的提示内容
					}
				});
				//清空搜索内容
				document.getElementById('search_content').value = '';
			} else {
				toast(1, "请输入搜索内容");
			}
		})
	});
});

//按条件查询排序会员列表
/*@param 
 	sort_type:排序条件
 * */
function sortMemberByConditions(sort_type, gender) {
	console.log('排序:' + sort_type);
	console.log('性别:' + gender);
	$("#member_list_ul li").remove();
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessVip",
		type: "POST",
		dataType: 'json',
		data: {
			"business_id": storage["business_id"],
			"sort_type": sort_type,
			"gender": gender
		},
		success: function(data) {
			toast(3, "关闭loading");
			console.log(JSON.stringify(data));
			if (parseInt(data.status) === 0) {
				if (data.data != null && data.data.length > 0) {
					$('#publicnull_tip').hide();
					var list = data.data;
					for (var index = 0; index < list.length; index++) {
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
					console.log(1);
					// $('#publicnull_tip').css('display','inline');
					$('#publicnull_tip').show();
				}
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(JSON.stringify(XMLHttpRequest));
			console.log(XMLHttpRequest.readyState);
			console.log(errorThrown);
		}
	});
}
