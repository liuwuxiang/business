var storage = null;
mui.init();
mui.plusReady(function(){
	mui.ready(function(){
		// 初始化本地存储
		storage = window.localStorage;
		// 获取数据
		toast(2,"打开Loading");
		getDataComposition();
		getSalesConstitute();
		getwaitAccountEntry();
	})
})

function getwaitAccountEntry(){
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getWaitAccountEntry",
		type: "POST",
		dataType: 'json',
		data: {'business_id':storage['business_id']},
		success: function(data) {
			toast(3,"关闭Loading");
			if(data.status == 0 && data.data != null){
				for(var i=0;i<data.data.length;i++){
					if(data.data[i].salesVolume == undefined || data.data[i].salesVolume == ''){
						continue;
					}
					var html2 =	'<tr>                '+
								'	<td>'+data.data[i].CommoditiesName+'</td> '+
								'	<td>'+data.data[i].salesVolume+'</td>       '+
								'	<td>'+data.data[i].money+'</td>      '+
								'</tr>';
					$('#waitAccountEntry').append(html2);
				}
			} else if(data.status == 2){
				mMain.gotoLogin();
			} else {
				plus.nativeUI.toast(data.msg); 
			}
		}
	});
}

/**
 * 销售构成 和 获取交易笔数构成
 */
function getSalesConstitute(){
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getSalesComposition",
		type: "POST",
		dataType: 'json',
		data: {'business_id':storage['business_id']},
		success: function(data) {
			toast(3,"关闭Loading");
			if(data.status == 0 && data.data != null){
				for(var i = 0; i < data.data.length; i++){
					var salesVolume = data.data[i].salesVolume;
					if(salesVolume == undefined || salesVolume == ""){
						salesVolume = 0;
						continue;
					}
					var html = 	'<tr>                '+
								'	<td>'+data.data[i].CommoditiesName+'</td> '+
								'	<td>'+salesVolume+'</td>       '+
								'	<td>'+data.data[i].transactionNumber+'</td>      '+
								'</tr>';
					var money = data.data[i].money;
					$('#salesConstitute').append(html);
				}
				
				for(var i = 0; i < data.data.length; i++){
					var salesVolume = data.data[i].salesVolume;
					if(salesVolume == undefined || salesVolume == ""){
						salesVolume = 0;
						continue;
					}
					if(money == undefined || money == ""){
						money = 0.00;
					}
					else{
						money = parseFloat(money).toFixed(2)
					}
					var html2 =	'<tr>                '+
								'	<td>'+data.data[i].CommoditiesName+'</td> '+
								'	<td>'+salesVolume+'</td>       '+
								'	<td>'+money+'</td>      '+
								'</tr>';
					$('#transactionConstitute').append(html2);
				}
			} else if(data.status == 2){
				mMain.gotoLogin();
			} else {
				plus.nativeUI.toast(data.msg); 
			}
		}
	});
}

/**
 * 获取数据概况
 */
function getDataComposition(){
	jQuery.support.cors = true;
	$.ajax({
		url: mMain.url + "/wnk_business_app/v1.0.0/getDataComposition",
		type: "POST",
		dataType: 'json',
		data: {'business_id':storage['business_id']},
		success: function(data) {
			toast(3,"关闭Loading");
			if(data.status == 0 && data.data != null){
				document.getElementById('commodityTotal').innerHTML = data.data.commodityTotal;
				document.getElementById('salesTotal').innerHTML = data.data.salesTotal;
				document.getElementById('transactionTotal').innerHTML = data.data.transactionTotal;
				document.getElementById('buyTotal').innerHTML = data.data.buyTotal;
			} else if(data.status == 2){
				mMain.gotoLogin();
			} else {
				plus.nativeUI.toast(data.msg); 
			}
		}
	});
}