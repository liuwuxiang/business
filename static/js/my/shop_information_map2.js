var storage = null;
var map = null;
mui.init();
mui.plusReady(function() {

	mui.ready(function() {
		storage = window.localStorage;
//		document.getElementById('back').addEventListener('tap', mMain.back);
		createMap();

	});

});

//创建地图
function createMap(){
	//地图加载
    map = new AMap.Map("container", {
        resizeEnable: true
    });
    //输入提示
    var autoOptions = {
        input: "tipinput"
    };
    var auto = new AMap.Autocomplete(autoOptions);
    var placeSearch = new AMap.PlaceSearch({
        map: map
    });  //构造地点查询类
    AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
    function select(e) {
    		var lng = e.poi.location.lng;
    		var lat = e.poi.location.lat;
    		var address = e.poi.address;
        console.log("lng="+lng+";lat="+lat+";address="+address);
        placeSearch.setCity(e.poi.adcode);
        placeSearch.search(e.poi.name);  //关键字查询查询
    }
}
