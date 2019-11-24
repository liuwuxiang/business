var xieyi = 0;
mui.init();
mui.plusReady(function(){
	mui.ready(function(){
		// 0 - 商家协议 1-商家升级协议
		var value = plus.webview.currentWebview();
		xieyi = value.xieyi_type;
		var click_type = value.click_type;
		if(parseInt(xieyi) === 0){
			document.getElementById('shangjia').style.display = 'inline';
			document.getElementById('shengji').style.display = 'none';
			if(click_type == 1){
				document.getElementById('aggree_button2').style.display = 'none';
			}
		} else {
			document.getElementById('shangjia').style.display = 'none';
			document.getElementById('shengji').style.display = 'inline';
			if(click_type == 1){
				document.getElementById('aggree_button').style.display = 'none';
			}
		} 

		mui('.head').on('tap','.submit',function(){
			// 页面相对路径
			var url;
			// 页面ID
			var id;
			// 需要传递的参数
			var param = null;
			var bottom = '51px';
			switch (parseInt(xieyi)) {
				case 0: // 商家
					url = "./business_register.html";
					id = "business_register.html";
					bottom = '0px';
					break;
				case 1: // 商家升级
					url = "/web/level_integral/my_level.html";
					id = "my_level.html";
					bottom = '51px';
					break;
			}
			mui.openWindow({
				url: url,
				id: id,
				styles: {
					top: '0px',
					bottom: bottom,
				},
				extras: param,
				createNew: true,
			});
		})
		
	})
})