/*
* toast提示
* type=0:正确提示,type=1：错误提示,type=2:Loading;type=3:关闭loading
* content:提示内容
* */
function toast(type,content) {
    if (type == 0 || type == 1){
        hui.closeLoading();
//      $.toast(content, "text");
        mui.toast(content);
    }
    else if (type == 2){
        hui.loading('请稍后');
    }
    else{
        hui.closeLoading();
    }
}