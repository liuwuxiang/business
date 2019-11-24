var storage = null;
//当前协议选中状态(0-未选择,1-已选择)
var xieyiChooseState = 0; 
		mui.init();
		mui.plusReady(function(){
			mui.ready(function(){
				storage = window.localStorage;
				// 检查商家认证状态
				selectBusinessLegalize();
				
				document.getElementById('ok').addEventListener('tap',function(){
					if(xieyiChooseState == 0){
						mui.alert("请阅读并同意商家入驻协议","猛戳商家版",null,null,'div');
					} else {
						mui.openWindow({
							url: './legalize.html',
							id: 'legalize.html',
							styles: {
								top: '0px',
								bottom: '51px',
							},
							createNew: true,
						});
					}
				});
				
				document.getElementById('read_xieyi').addEventListener('tap',function(){
					mui.openWindow({
						url: '/protocol.html',
						id: 'protocol.html',
						styles: {
							top   : '0px',
							bottom: '0px'
						},
						createNew: true,
						extras:{
							xieyi_type:'0', // 0 - 商家协议 1-商家升级协议
							click_type:1
						}
					});
				});
				
			});
			
			/**
			 * 获取商家认证状态
			 */
			function selectBusinessLegalize(){
				toast(2, "打开loading");
				jQuery.support.cors = true;
				$.ajax({
					url: mMain.url + "/wnk_business_app/v1.0.0/selectBusinessLegalize",
					type: "POST",
					dataType: 'json',
					timeout : 10000, //超时时间设置，单位毫秒
					data: {'business_id': storage['business_id']},
					success: function(data) {
						toast(3,"关闭loading");
						if(data.status == 0) {
							if(String(data.data.status) == '已认证'){
								mui.confirm('正在审核或已认证','猛戳商家版',['确定'],function(){
									mui.openWindow({
										url: '../my/my.html',
										id: 'my.html',
										styles: {
											top: '0px',
											bottom: '51px',
										},
										show: {
											aniShow: 'none', //页面显示动画，默认为”slide-in-right“；
										},
										waiting: {
											autoShow: true, //自动显示等待框，默认为true
										}
									});
								},'div');
							}
						} else if(data.status == 2) {
							mMain.gotoLogin();
						} else {
							toast(1,data.msg);
						}
					},
					error : function(XMLHttpRequest,status){
						toast(3,"关闭loading");
						if(status == 'timeout'){
							plus.nativeUI.toast("连接超时,请重试");
							plus.webview.close('legalize_tis.html','slide-out-right');
						} else {
							plus.nativeUI.toast("连接出错,请重试");
							plus.webview.close('legalize_tis.html','slide-out-right');
						}
					}
				});
			}
		})
		

//协议选择事件
function chooseXieyi(){
	if(xieyiChooseState == 0){
		xieyiChooseState = 1;
		document.getElementById('xieyi_checkbox').src = "../../static/images/wnk_business/checked.png";
	}
	else{
		xieyiChooseState = 0;
		document.getElementById('xieyi_checkbox').src = "../../static/images/wnk_business/no_check.png";
	}
}
