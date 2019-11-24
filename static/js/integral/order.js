var storage = null;
mui.init({
	swipeBack: true //启用右滑关闭功能
});
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;

		optionClick(0);

		mui('.wrap').on('tap', '.item', function() {
			var id = this.getAttribute('id');
			if(String(id) === 'order_all') {
				optionClick(0);
			} else if(String(id) === 'order_no') {
				optionClick(1);
			} else {
				optionClick(2);
			}
		})

		// 从别个页面返回时触发
		window.addEventListener('keydownClose', function(event) {
			optionClick(0);
		});

	});

	/**
	 * 选项切换事件(0-全部订单,1-未完成订单,2-已完成订单)
	 * @param index
	 */
	function optionClick(index) {
		if(index === 0) {
			document.getElementById("order_all").setAttribute("class", "item sel");
			document.getElementById("order_no").setAttribute("class", "item");
			document.getElementById("order_yes").setAttribute("class", "item");
		} else if(index === 1) {
			document.getElementById("order_all").setAttribute("class", "item");
			document.getElementById("order_no").setAttribute("class", "item sel");
			document.getElementById("order_yes").setAttribute("class", "item");
		} else if(index === 2) {
			document.getElementById("order_all").setAttribute("class", "item");
			document.getElementById("order_no").setAttribute("class", "item");
			document.getElementById("order_yes").setAttribute("class", "item sel");
		} else {
			document.getElementById("order_all").setAttribute("class", "item");
			document.getElementById("order_no").setAttribute("class", "item");
			document.getElementById("order_yes").setAttribute("class", "item");
		}
		if(index !== 3) {
			getOrderData(index);
		}
	}

	/**
	 * 获取订单信息
	 * @param index 哪一个分类的订单
	 */
	function getOrderData(index) {
		$.showLoading("数据加载中");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + '/wnk_business/getIntegralOrder',
			type: "post",
			dataType: 'json',
			timeout: 5000,
			data: {
				"business_id": storage["business_id"],
				'type': index
			},
			success: function(data) {
				var content = $('#content');
				content.empty();
				if(data.status === 0) {
					$.hideLoading();
					if(data.data.length !== 0) {
						// 设置背景颜色
						// background-color: #F3F4F5
						content.css('background-color', '#F3F4F5');
						data.data.forEach(function(ret) {
							var status = ret.status === 0 ? "已支付" : "已完成";
							content.append('' +
								'    <div class="weui-form-preview">                                      ' +
								'        <div class="weui-form-preview__hd">                              ' +
								'            <div class="weui-form-preview__item">                        ' +
								'                <label class="weui-form-preview__label">支付积分</label>  ' +
								'                <em class="weui-form-preview__value">' + ret.price + '</em>  ' +
								'            </div>                                                       ' +
								'        </div>                                                           ' +
								'        <div class="weui-form-preview__bd">                              ' +
								'            <div class="weui-form-preview__item">                        ' +
								'                <label class="weui-form-preview__label">商品名称</label>  ' +
								'                <span class="weui-form-preview__value">电动打蛋机</span>  ' +
								'            </div>                                                       ' +
								'            <div class="weui-form-preview__item">                        ' +
								'                <label class="weui-form-preview__label">买家姓名</label>  ' +
								'                <span class="weui-form-preview__value">' + ret.username + '</span>' +
								'            </div>                                                       ' + '            <div class="weui-form-preview__item">                        ' +
								'                <label class="weui-form-preview__label">买家电话</label>  ' +
								'                <span class="weui-form-preview__value">' + ret.phone + '</span>' +
								'            </div>                                                       ' +
								'            <div class="weui-form-preview__item">                        ' +
								'                <label class="weui-form-preview__label">商品状态</label>  ' +
								'                <span class="weui-form-preview__value">' + status + '</span> ' +
								'            </div>                                                       ' +
								'        </div>                                                           ' +
								'    </div>                                                               ' +
								'    <br>');
						});
					} else {
						// 重新设置下背景颜色,防止切换后无数据颜色没改回来
						content.css('background-color', '#FFF');
						content.append('' +
							'<div class="weui-loadmore weui-loadmore_line">        ' +
							'    <span class="weui-loadmore__tips">暂无数据</span>  ' +
							'</div>');
					}
				} else if(data.msg == 1) {
					mMain.gotoLogin();
				} else {
					$.hideLoading();
					mui.toast(data.msg);
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

});