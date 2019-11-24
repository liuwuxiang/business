mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {
	mui.ready(function() {
		mui('.memmenu').on('tap', '.item', function() {
			var name = this.getAttribute('name');
			var urls, ids;
			switch(name) {
				case 'type':
					urls = "./type.html";
					ids = "type.html";
					break;
				case 'goods':
					urls = "./goods.html";
					ids = "goods.html";
					break;
				case 'order':
					urls = "./order.html";
					ids = "order.html";
					break;
			}
			mui.openWindow({
				url: urls,
				id: ids,
				styles: {
					top: '0px',
					bottom: '51px',
				},
				createNew: true, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
			});
		})
	});
});