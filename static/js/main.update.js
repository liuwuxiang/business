/**
 * @Name：增量更新检测
 * @Author：杨新杰
 * @Site：http://www.it100000.com
 */

// 当前应用版本号
var wgtVer = '';
// 最新版本号
var newVer = '';
// 检测更新地址
var checkUrl = mMain.url + '/download/check';
// 下载更新地址
var downloadUrl = mMain.url + '/download/getUpdate';
// 下载apk地址
var downAPKloadUrl = mMain.url + '/download?type=business';
//是否展示loading(-1不展示，0展示)
var lodingState = -1;

//手动调用检查更新
//function getLocalVerSD() {
//	lodingState = 0;
//	getLocalVer();
//}

/**
 * 获取应用本地版本号
 */
function getLocalVer() {
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		wgtVer = inf.version;
		// 获取最新版本号
		checkUpdate();
	});
}

/**
 * 获取服务器最新版本号
 */
function checkUpdate() {
	if(lodingState == 0) {
		plus.nativeUI.showWaiting("检测中..");
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		switch(xhr.readyState) {
			case 4:
				if(lodingState == 0) {
					plus.nativeUI.closeWaiting();
				}
				if(xhr.status == 200) {
					var json = JSON.parse(xhr.responseText);
					newVer = json.data.version;
					var status = json.status;
					if(status == 0) {
						// console.log("version="+newVer);
						var update_type = json.data.update_type;
						if(wgtVer != '' && newVer != '' && wgtVer < newVer) {
							if(update_type == 0) {
								mui.confirm('检测到新版本,是否更新', ['取消', '更新'], function(e) {
									if(e.index == 0) {
										//确定
										downWgt();
									} else {
										//取消
									}
								});
							} else {
								mui.confirm('检测到新版本,是否更新', ['取消', '更新'], function(e) {
									if(e.index == 0) {
										//确定
										downApk();
									} else {
										//取消
									}
								});
							}
						} else {
							if(lodingState == 0) {
								plus.nativeUI.toast("当前版本已是最新版本！");
							}
						}
					} else {
						if(lodingState == 0) {
							plus.nativeUI.toast(json.msg);
						}
					}
				} else {
					if(lodingState == 0) {
						plus.nativeUI.toast('检测更新失败');
					}
				}
				break;
		}
	}
	xhr.open('POST', checkUrl);
	xhr.send();

}

/**
 * 下载增量更新包
 */
function downWgt() {
	plus.nativeUI.showWaiting("正在更新..");
	plus.downloader.createDownload(downloadUrl + "?ver=" + newVer, {
		filename: "_doc/update/"
	}, function(d, status) {
		plus.nativeUI.closeWaiting();
		if(status == 200) {
			console.log("下载wgt成功：" + d.filename);
			installWgt(d.filename); // 安装wgt包
		} else {
			console.log("下载wgt失败！");
			plus.nativeUI.alert("下载失败！");
		}
	}).start();
}

/**
 * 下载apk安装包
 */
function downApk() {
	plus.nativeUI.showWaiting("正在下载..");
	plus.downloader.createDownload(downAPKloadUrl, {
		filename: "_doc/update/"
	}, function(d, status) {
		plus.nativeUI.closeWaiting();
		if(status == 200) {
			plus.nativeUI.alert("即将开始安装！");
			console.log("下载wgt成功：" + d.filename);
			installAPK(d.filename);
		} else {
			console.log("下载wgt失败！");
			plus.nativeUI.alert("下载失败！");
		}
	}).start();
}

/**
 * 安装包 
 * @param {Object} path 下载的安装包路径
 */
function installAPK(path) {
	plus.runtime.quit();
	//	plus.nativeUI.showWaiting("安装中...");
	plus.runtime.install(path, {}, function() {
		//      plus.nativeUI.closeWaiting();
		console.log("安装wgt文件成功！");
	}, function(e) {
		//      plus.nativeUI.closeWaiting();
		console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
	});
}

/**
 * 安装增量更新 
 * @param {Object} path 下载的安装包路径
 */
function installWgt(path) {
	plus.nativeUI.showWaiting("安装中...");
	plus.runtime.install(path, {}, function() {
		plus.nativeUI.closeWaiting();
		console.log("安装wgt文件成功！");
		plus.nativeUI.alert("应用资源更新完成,应用即将重启！", function() {
			plus.runtime.restart();
		});
	}, function(e) {
		plus.nativeUI.closeWaiting();
		console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
		plus.nativeUI.alert("更新失败[" + e.code + "]：" + e.message);
	});
}

//! function(win, doc) {
//	lodingState = -1;
//	// 开始检测更新
//	if(window.plus) {
//		getLocalVer();
//	} else {
//		document.addEventListener('plusready', getLocalVer, false);
//	}
//}(window, document)

var mainUpdate = {
	init: function(state) {
		lodingState = state;
		// 开始检测更新
		if(window.plus) {
			getLocalVer();
		} else {
			document.addEventListener('plusready', getLocalVer, false);
		}
	}
}

mainUpdate.init(-1);