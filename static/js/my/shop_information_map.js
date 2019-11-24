// 扫描对象
var scan = null;

// 本地存储对象
var storage = window.localStorage;
// 添加遮罩层对象
var marker = null;
// 地图对象
var map = null;
// 选择地点现行
var adders = null;
var longitude = null;
var latitude = null;
mui.init();
mui.plusReady(function() {


	mui.ready(function() {
		// 获取手机屏幕高度
		var phoneHeight = plus.screen.resolutionHeight;
		// 获取当前1rem等于多少px 然后计算顶部高度
		var headHeight = parseInt(document.documentElement.clientHeight / 7.5 * 0.88);
		// 给扫描框设置高度 屏幕高度-底部高度-顶部高度
		document.getElementById('map').style.height = (phoneHeight - 42 - headHeight) + 'px';
		
		// 获取参数并初始化地图
		var self = plus.webview.currentWebview();
		initMaps(self.lat,self.longt,self.addrs);
		
		// 绑定确定按钮点击事件
		document.getElementById('searchCancel').addEventListener('tap',function(){
			/*
			console.log('adders' + adders);
			console.log('latitude:' + longitude);
			console.log('latitude:' + latitude);
			*/
			mui.fire(plus.webview.getWebviewById('shop_information.html'),'mapOk',{'adders':adders,'longitude':longitude,'latitude':latitude});
			// 关闭当前页面
			plus.webview.close(plus.webview.getTopWebview().id, 'slide-out-right');
		});
		
		// 绑定搜索按钮点击事件
		document.getElementById('mapsSearch').addEventListener('keyup',enterSearch);
	});

	/**
	 * 初始化地图
	 */
	function initMaps(lat_extras,longt_extras,addrs_extras) {
		map = new plus.maps.Map('map');
		//设置缩放级别
		map.setZoom(20);
		var lat   = lat_extras;
		var longt = longt_extras;
		if (lat != '' && lat != undefined) {
			var point = new plus.maps.Point(longt, lat);
			// 初始化标记点
			marker = new plus.maps.Marker(point);
			marker.setIcon("/static/images/wnk_business/point_icon.png");
			marker.setLabel('');
			marker.setBubble(new plus.maps.Bubble(addrs_extras), true);
			map.setCenter(point);
			map.addOverlay(marker);

			adders    = addrs_extras;
			latitude  = point.latitude;
			longitude = point.longitude;
			
		} else {
			// 初始化获取当前设备位置
			map.getUserLocation(function(state, point) {
				if (status == 0) {
					// 反向地理编码
					plus.geolocation.getCurrentPosition(function(p) {

						plus.maps.Map.reverseGeocode(point, {
							city: p.address.city
						}, function(e) {
							// 初始化标记点
							marker = new plus.maps.Marker(point);
							marker.setIcon("../../static/images/wnk_business/point_icon.png");
							marker.setLabel('');
							marker.setBubble(new plus.maps.Bubble(e.address), true);
							map.setCenter(point);
							map.addOverlay(marker);

							adders    = e.address;
							latitude  = point.latitude;
							longitude = point.longitude;
						});
					});
				}
			});
		}

		// 地图点击回调
		map.onclick = function(point) {
			// 反向地理编码
			plus.geolocation.getCurrentPosition(function(p) {
				plus.maps.Map.reverseGeocode(point, {
					city: p.address.city
				}, function(e) {
					// 清空所有标记点
					map.clearOverlays();
					// 初始化标记点
					marker = new plus.maps.Marker(point);
					marker.setBubble(new plus.maps.Bubble(e.address), true);
					map.setCenter(point);
					map.addOverlay(marker);
					// 更新当前坐标点现行
					adders = e.address;
					latitude = point.latitude;
					longitude = point.longitude;
				});
			});
		}
	}

	/**
	 * 用户按下搜索按钮
	 * @param {Object} e
	 */
	function enterSearch(e) {
		if (e.keyCode == 13) {
			document.activeElement.blur();
			var search = document.getElementById('mapsSearch').value;
			if (search !== undefined && search !== '') {
				plus.geolocation.getCurrentPosition(function(p) {
					// 将检索到的第一条信息作为标点添加到地图中
					var searchObj = new plus.maps.Search(map);
					searchObj.onPoiSearchComplete = function(state, result) {
						if (state == 0) {
							if (result.currentNumber <= 0) {
								mui.toast('无搜索结果')
							}
							map.clearOverlays();
							var pos = result.getPosition(0);
							marker.setPoint(pos.point);
							marker.setLabel(pos.name);
							marker.setBubble(new plus.maps.Bubble(pos.address), true);
							map.addOverlay(marker);
							map.setCenter(pos.point);

							adders    = pos.address + pos.name;
							latitude  = pos.point.latitude;
							longitude = pos.point.longitude;
						} else {
							mui.toast('搜索失败');
						}
					}
					searchObj.poiSearchNearBy(search, new plus.maps.Point(p.coords.longitude, p.coords.latitude), 10000);;
				});
			}
		}
	}




});
