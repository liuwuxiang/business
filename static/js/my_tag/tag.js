'use strict';
var storage = window.localStorage;
mui.init();
mui.plusReady(function() {
	mui.ready(function() {
		getWnkBusinessOneTagAll();
		// 提交按钮点击事件
		document.getElementById('business_tag').addEventListener('tap', saveBusinessTag);
	});

	/**
	 * 获取所有商户标签 - 一级标签
	 */
	function getWnkBusinessOneTagAll() {
		var url = mMain.url + "//wnk_business_app/v1.0.0/getWnkBusinessOneTag";
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				var tag_from = document.getElementById('tag_from');
				
				//tag_from.innerHTML = '';
				
				var json = JSON.parse(xhr.responseText);
				json.data.forEach(function(item) {
// 					var div       = document.createElement('div');
// 					div.className = 'ftitle';
// 					div.innerHTML = item.name;
// 					div.id        = 'tag_tow_' + item.id;
// 					tag_from.appendChild(div);
					
					// <h5 class="mui-content-padded">列表模式的单选框</h5>
					var h5 = document.createElement('h5');
					h5.className = 'mui-content-padded';
					h5.innerHTML = item.name;
					h5.id        = 'tag_tow_' + item.id;
					tag_from.appendChild(h5);
				});
				
				
				// 开始获取二级标签
				getWnkBusinessTowTagAll();
			}
		}
		xhr.open('POST', url);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send('business_id=' + storage['business_id']);
	}

	/**
	 * 获取所有商户标签 - 二级标签
	 */
	function getWnkBusinessTowTagAll() {
		var url = mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessTowTag";
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				var json = JSON.parse(xhr.responseText);
				json.data.forEach(function(item) {
					// 获取到一级菜单
					var tag_tow = document.getElementById('tag_tow_' + item.last_id);
					
					/*
					<div class="mui-input-row mui-radio">
						<label>radio</label>
						<input name="radio1" type="radio" checked>
					</div>
					
					*/
					// 创建需要的元素
					var div   = document.createElement('div');
					var label = document.createElement('label');
					var input = document.createElement('input');
					// 给需要的元素赋值
					div.className   = 'mui-input-row mui-radio';
					label.innerHTML = item.name;
					input.type      = 'radio';
					input.setAttribute('data-name',"one_tag_"+ item.last_id);
					input.name      = 'tag-two';
					input.value     = item.id;
					// 元素追加
					div.appendChild(label);
					div.appendChild(input);
					insertAfter(div,tag_tow);
				})
				// 获取商户已经选择的标签
				getWnkBusinessIfTrue();
			}
		}
		xhr.open('POST', url);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send('business_id=' + storage['business_id']);
	}

	/**
	 * 获取用户已经选用的标签
	 */
	function getWnkBusinessIfTrue() {
		var url = mMain.url + "/wnk_business_app/v1.0.0/getWnkBusinessIfTrue";
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				var json = JSON.parse(xhr.responseText);
				if(json.data.length > 0){
					json.data.forEach(function(item) {
					var towTag = document.getElementsByName('tag-two');
					for(var i = 0 ; i < towTag.length;i++){
						if(towTag[i].value == item.two_tag_id){
							towTag[i].checked = true;
						}
					}
				});
				}
				
			}
		}
		xhr.open('POST', url);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send('business_id=' + storage['business_id']);
	}

	/**
	 * 保存用户已经选中的标签
	 */
	function saveBusinessTag() {
		var arr = new Map();
		var towTag = document.getElementsByTagName('input');
		for(var i = 0; i < towTag.length; i++) {
			if(towTag[i].type == 'radio') {
				var status = towTag[i].checked;
				var towId = towTag[i].value;
				arr[towId] = status;
			}
		}
		
		console.log(_mapToJson(arr));
		return;
		
		if(searchSubStr(_mapToJson(arr),'true').length > 1){
			mui.alert("最多选择一个标签","猛戳商家版",["确定"],null,"div");
			return;
		}

		toast(2, "打开loading");
		jQuery.support.cors = true;
		$.ajax({
			url: mMain.url + "/wnk_business_app/v1.0.0/saveBusinessTag",
			type: "POST",
			dataType: 'json',
			data: {
				'business_id':storage["business_id"],
				'arr'        : _mapToJson(arr)
			},
			success: function(data) {
				if(data.status == 0){
					mui.alert(data.msg,"猛戳商家版",null,function(){
						mMain.back();
					},'div');
				}
			},
		});
	}
	
	
	
	/////////////////////////////////////////////////////////// 工具方法 ///////////////////////////////////////////
	// 向元素之前追加元素(原生)
	function insertAfter(newElement, targentElement) {
		var parent = targentElement.parentNode;
		if (parent.lastChild == targentElement) {
			parent.appendChild(newElement);
		} else {
			parent.insertBefore(newElement, targentElement.nextSibling)
		}
	}
	
	// 查找子串 返回数组.每个元素代表出现的位置
	function searchSubStr(str,subStr){
		var positions = new Array();
	    var pos = str.indexOf(subStr);
	    while(pos>-1){
	        positions.push(pos);
	        pos = str.indexOf(subStr,pos+1);
	    }
	    return positions;
	}

	function _strMapToObj(strMap) {
		let obj = Object.create(null);
		for(var keys in strMap){
			obj[keys] = strMap[keys]
		}
		return obj;
	}
	// map转换为json
	function _mapToJson(map) {
		return JSON.stringify(_strMapToObj(map));
	}

});