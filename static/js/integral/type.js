var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	storage = window.localStorage;
	mui.ready(function() {

		init();

		document.getElementById('joinIntegralTypeEdit').addEventListener('tap', function() {
			mui.openWindow({
				url: './type_edit.html',
				id: 'type_edit.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
		});

		mui('#isYes').on('tap', '.item', function() {
			var type_id = this.getAttribute('name');
			mui.openWindow({
				url: './type_edit.html',
				id: 'type_edit.html',
				styles: {
					top: '0px',
					bottom: '51px',
				},
				extras: {
					'type_id': type_id
				},
				createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
		});

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			init();
		});
	});

	function init() {
		$.showLoading("载入数据中...");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business/getIntegralTypeAll',
			type: 'post',
			dataType: 'json',
			timeout: 5000,
			data: {
				'business_id': storage['business_id']
			},
			success: function(data) {
				var isYes = $('#isYes');
				var isNo  = $('#isNo');
				$.hideLoading();
				if(parseInt(data.status) === 0) {
					if(parseInt(data.data.length) === 0) {
						isYes.addClass(" dataNotNUll");
					} else {
						isNo.addClass(" dataNotNUll");
						var yes = $('#yes');
						var no  = $('#no');
						yes.empty();
						no.empty();
						data.data.forEach(function(ret) {
							if(parseInt(ret.is_checked) === 0) {
								yes.append('<a href="javascript:void(0);" class="item member A' + ret.name + '" name="' + ret.id + '">' + ret.name + '</a>');
								yes.append('<style>.A' + ret.name + ':before{background-image: url(' + data.msg + ret.img + ') !important;border-radius:50%;}</style>');
							} else {
								no.append('<a href="javascript:void(0);" class="item member A' + ret.name + '"  name="' + ret.id + '">' + ret.name + '</a>');
								no.append('<style>.A' + ret.name + ':before{background-image: url(' + data.msg + ret.img + ') !important;border-radius:50%;}</style>');
							}
						});
					}
				} else if(data.status == 2) {
					mMain.gotoLogin();
				} else {
					mui.toast(data.msg);
				}
			}
		});
	}
});