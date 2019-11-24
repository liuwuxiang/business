(function(mui, $) {
	var storage = window.localStorage;
	mui.init();
	mui.plusReady(function() {
		// mui相关代码
		mui.ready(function() {
			// 绑定事件
			eventBinding();
			// 默认为待审核状态
			listOptionInit(0);
		});
	});

	/**
	 * 事件绑定
	 */
	function eventBinding() {
		// 头部 Tab菜单 STR 点击事件
		mui('.wrap').on('tap', '.item', function() {
			var id = this.getAttribute('id');
			if(String(id) == 'unreviewed') {
				listOptionInit(0);
			} else if(String(id) == 'normal') {
				listOptionInit(1);
			} else {
				listOptionInit(2)
			}
		})
		// 添加轮播图推广按钮点击事件	
		$('#gallery').click(function() {
			// 关闭弹出菜单和遮罩层
			$('#topPopover_div').removeClass('mui-active');
			$('.mui-backdrop').remove();
			mui.confirm("请选择轮播图推广类型", '猛戳商家版', ['广告长图', '进入主页'], function(e) {
				mui.openWindow({
					url: './doings_spread_edit.html',
					id: 'doings_spread_edit.html',
					styles: {
						top: '0px',
						bottom: '51px',
					},
					extras: {
						'type': '0',
						'ad_type': e.index
					}, //额外扩展参数
					createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
				});
			}, 'div');

		});
		// 系统消息推广按钮点击事件
		$('#system_msg').click(function() {
			// 关闭弹出菜单和遮罩层
			$('#topPopover_div').removeClass('mui-active');
			$('.mui-backdrop').remove();
			mui.openWindow({
				url: './doings_spread_edit.html',
				id: 'doings_spread_edit.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				extras: {
					'type': '1',
				}, //额外扩展参数
				createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
		})
	}

	/*
	 *	列表项初始化
	 *  type=0:待审核,type=1：推广中,type=2：已下架
	 * */
	function listOptionInit(type) {
		if(type == 0) {
			$('#unreviewed').addClass(' sel');
			$('#normal').removeClass(' sel');
			$('#shut_down').removeClass(' sel');
			// 获取我发布的推广广告
			getBusinessIdAd(String(0));
		} else if(type == 1) {
			$('#unreviewed').removeClass(' sel');
			$('#normal').addClass(' sel');
			$('#shut_down').removeClass(' sel');
			getBusinessIdAd(String(1));
		} else if(type == 2) {
			$('#unreviewed').removeClass(' sel');
			$('#normal').removeClass(' sel');
			$('#shut_down').addClass(' sel');
			getBusinessIdAd(String(2));
		}
	}

	function getBusinessIdAd(type) {
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/getBusinessIdAdById",
			type: "POST",
			dataType: 'json',
			data: {
				"business_id": storage["business_id"],
				"type": String(type),
			},
			success: function(data) {
				var content = $('#content');
				content.empty();
				if(data.status == 0) {
					data.data.forEach(function(e) {
						var ad_type = e.ad_type == 0 ? '轮播图' : '系统消息';
						var receive_type = null;
						switch(e.receive_type) {
							case 0:
							receive_type ='所有商家和用户';
								break;
							case 1:
							receive_type ='所有商家';
								break;
							case 2:
							receive_type ='所有用户';
								break;
							case 3:
							receive_type ='我的会员';
								break;
							case 3:
							receive_type ='我的商家';
								break;
						}
						var html = '<div class="weui-form-preview">' +
							'	<div class="weui-form-preview__hd">' +
							'		<label class="weui-form-preview__label">广告名称</label>' +
							'		<em class="weui-form-preview__value">' + e.title + '</em>' +
							'	</div>' +
							'	<div class="weui-form-preview__bd">' +
							'		<div class="weui-form-preview__item">' +
							'			<label class="weui-form-preview__label">广告类型</label>' +
							'			<span class="weui-form-preview__value">' + ad_type + '</span>' +
							'		</div>' +
							'		<div class="weui-form-preview__item">' +
							'			<label class="weui-form-preview__label">推广对象</label>' +
							'			<span class="weui-form-preview__value">'+receive_type+'</span>' +
							'		</div>' +
							'	</div>' +
							'</div>';
						content.append(html);
					})
				}
			}
		});
	}

})(mui, jQuery);