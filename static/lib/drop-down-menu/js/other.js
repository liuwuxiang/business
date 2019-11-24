

//顶部按钮事件
//排序按钮
$(document).ready(function() {
	$(".Sort").click(function() {
		if($('#paixu').hasClass('grade-w-roll')) {
			$('#paixu').removeClass('grade-w-roll');
		} else {
			$('#paixu').addClass('grade-w-roll');
		}
	});
});

//健身活动按钮
$(document).ready(function() {
	$(".Brand").click(function() {
		if($('#type_choose').hasClass('grade-w-roll')) {
			$('#type_choose').removeClass('grade-w-roll');
		} else {
			$('#type_choose').addClass('grade-w-roll');
		}
	});
});

//全城按钮
$(document).ready(function() {
	$(".Regional").click(function() {
		if($('#quancheng').hasClass('grade-w-roll')) {
			$('#quancheng').removeClass('grade-w-roll');
		} else {
			$('#quancheng').addClass('grade-w-roll');
		}
	});
});

//点击某一项收缩其他两项
//全称按钮
$(document).ready(function() {
	$(".Regional").click(function() {
		if($('#paixu').hasClass('grade-w-roll')) {
			$('#paixu').removeClass('grade-w-roll');
		};
	});
});
$(document).ready(function() {
	$(".Regional").click(function() {
		if($('#type_choose').hasClass('grade-w-roll')) {
			$('#type_choose').removeClass('grade-w-roll');
		};
	});
});
$(document).ready(function() {
	$(".Brand").click(function() {
		if($('#quancheng').hasClass('grade-w-roll')) {
			$('#quancheng').removeClass('grade-w-roll');
		};
	});
});
$(document).ready(function() {
	$(".Brand").click(function() {
		if($('#paixu').hasClass('grade-w-roll')) {
			$('#paixu').removeClass('grade-w-roll');
		};
	});
});
$(document).ready(function() {
	$(".Sort").click(function() {
		if($('#quancheng').hasClass('grade-w-roll')) {
			$('#quancheng').removeClass('grade-w-roll');
		};
	});
});
$(document).ready(function() {
	$(".Sort").click(function() {
		if($('#type_choose').hasClass('grade-w-roll')) {
			$('#type_choose').removeClass('grade-w-roll');
		};

	});
});
//4567890

var paixu = 4;
var gender = -1;
 

//排序选项点击事件
function Sorts(sbj) {
	paixu = sbj.getAttribute("data-type");
	var arr = document.getElementById("paixu_ul").getElementsByTagName("li");
	for(var i = 0; i < arr.length; i++) {
		var a = arr[i];
		a.style.color = "";
	};
	sbj.style.color = "#40E0D0";
	$('#paixu').removeClass('grade-w-roll');
	$(".Sort").text(sbj.innerText);

	setTimeout(function() {
		//请求数据
		sortMemberByConditions(paixu,gender);
	}, 500);
}

//按性别搜索控件选项点击事件
function BusinessTypes(sbj) {
	gender = sbj.getAttribute("data-type");
	var arr = document.getElementById("type_choose_ul").getElementsByTagName("li");
	for(var i = 0; i < arr.length; i++) {
		var a = arr[i];
		a.style.color = "";
	};
	sbj.style.color = "#40E0D0";
	$('#type_choose').removeClass('grade-w-roll');
	$(".Brand").text(sbj.innerText);

	setTimeout(function() {
		//请求数据
		sortMemberByConditions(paixu,gender);
	}, 500);
}