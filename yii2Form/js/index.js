function checkMobile(val){
    if(!/^13[0-9]{1}[0-9]{8}$|15[0-9]{1}[0-9]{8}$|18[0-9]{9}$|17[0678]{1}[0-9]{8}$|14[57]{1}[0-9]{8}$/.test(val)){
            return false;
    }else{
            return true;
    } 
} 



$(function() {
	//即刻预约
	$("#jkyy").click(function(){
		window.location.href="http://s.m.ziroom.com/clean/general/dailyIntro.shtml";
	});
	
	//分享提示
	$('#shareBtn').click(function(){
		$('#shareCon').show();
	});

	$('#shareCon').click(function(){
		$('#shareCon').hide();
	});
	
	//活动说明展示
	$("#shuoming_btn").click(function(){
		$("#shuoming").show();
	})
	//活动说明隐藏
	$("#shuoming_close").click(function(){
		$("#shuoming").hide();
	})
	$("#shuoming").click(function(){
		$("#shuoming").hide();
	})

	// 响应式缩放
	var autoScale = function() {
		var ratio = 320/520,
			winW = document.documentElement.clientWidth,
			winH = document.documentElement.clientHeight,
	    	ratio2 = winW/winH,
	    	scale,
	    	scalefirstAndLast;
    		if (ratio < ratio2) {
				scale = (winH/520).toString().substring(0, 6);
				scalefirstAndLast = (winW/320).toString().substring(0, 6);
			} else {
				scale = (winW/320).toString().substring(0, 6);
				scalefirstAndLast = (winH/520).toString().substring(0, 6);
			}
	    var cssText = '-webkit-transform: scale('+ scale +'); -webkit-transform-origin:center center; opacity:1;';
	    var cssTextFirstAndLast = '-webkit-transform: scale('+ scalefirstAndLast +'); -webkit-transform-origin:top center; opacity:1;';
	    var cssTextFirstAndLast2 = '-webkit-transform: scale('+ scalefirstAndLast +'); -webkit-transform-origin:top top; opacity:1;';
		
	};

	setTimeout(function() {
		if (document.documentElement.clientWidth/document.documentElement.clientHeight !== 320/520) {
	        autoScale();
	    } else {
	        $('.container').css({'opacity': 1});
	    }
	}, 300);

	// 初始化滑动组件
	slider = new mo.PageSlide({
		target: $('#page-wrapper .content > li')
	});
	
	var gif_show_src="";
	
	$("#shouye_btn").click(function(){
		slider.switchTo(1);
		$("#page6").hide();
	})

	var flag=0;
	//slider.touchMove(false);	// 禁止用户滑动
	slider.on('beforechange', function() {
			slider.touchMove(true);
	}).on('change', function(o,index){		
		toAni($('.page').eq(index));		
		if(index!=0 && index!=6){
			$('.icon-arrow').show();
		}else{
			$('.icon-arrow').hide();
		}	
		if(index==4){
			gif_show_src=$("#gif_show img").attr("_src");
			$("#gif_show img").attr("src",gif_show_src);
			var _t=setInterval(function(){
				$("#gif_show img").attr("src","");
				$("#gif_show").hide();
				clearInterval(_t);
			},7000)
		}	
		else{
			$("#gif_show").show();
			$("#gif_show img").attr("src","");
		}
		
		if(index==6){
			$("#page6").show();
		}	
		
	});

	function toAni(obj){
		
		$(obj).siblings().find('[data-ani]').each(function(){
			var ani = $(this).attr('data-ani');
			$(this).css('opacity',0).removeClass(ani +' animated');
		});

		$(obj).find('[data-ani]').each(function(){
			
			var speed = parseInt($(this).attr('data-delay'));
			var ani = $(this).attr('data-ani');
			var _this = $(this);
			_this.css('opacity',0);

			setTimeout(function(){
				_this.css('opacity',1).addClass(ani +' animated');
			},speed);
		});
	}
	


	// 初始化资源加载器
	var resList = [
		'img/arrow.png',
		'img/bg.jpg',
		'img/close_btn.png',
		'img/GIF.gif',
		
		'img/p1_bg2.png',
		'img/p1_icon1.png',
		'img/p1_icon2.png',
		'img/p1_icon3.png',
		'img/p1_icon4.png',
		'img/p1_logo.png',
		'img/p1_title.png',
		
		'img/p2_img1_.png',
		'img/p2_img1_2.png',
		'img/p2_img1.png',
		'img/p2_img2_.png',
		'img/p2_img2_2.png',
		'img/p2_img2.png',
		'img/p2_img3_.png',
		'img/p2_img3_2.png',
		'img/p2_img3.png',
		'img/p2_top.jpg',
		
		'img/p3_img1.jpg',
		'img/p3_img2.jpg',
		'img/p3_img3.jpg',
		'img/p3_img4.jpg',
		'img/p3_top.jpg',
		
		'img/p4_img.png',
		'img/p4_img2.png',
		'img/p4_img3.png',
		'img/p4_top.jpg',
		
		'img/p5_bg1.png',
		'img/p5_bg2.png',
		'img/p5_bg3.png',
		'img/p5_bg4.png',
		'img/p5_bg5.png',
		'img/p5_bg6.png',
		'img/p5_bg7.png',
		'img/p5_bg8.png',
		'img/p5_bg9.png',
		'img/p5_bg10.png',
		'img/p5_bg11.png',
		'img/p5_bg12.png',
		'img/p5_bg13.png',
		'img/p5_bg14.png',
		'img/p5_bg15.png',
		'img/p5_bg16.png',
		'img/p5_bg17.png',
		'img/p5_bg18.png',
		'img/p5_bottom.png',
		'img/p5_people.png',
		'img/p5_top.png',
		
		'img/p6_arrow.png',
		'img/p6_name.png',
		'img/p6_shuoming.png',
		
		'img/p7_ewm.jpg',
		'img/p7_img.jpg',
		'img/p7_success.png',
		
		'img/rp.png',
		'img/share_img.png',
		'img/share.jpg',
		'img/shuoming_name.png'
		
	];

	var $num = $('.font-num'),
		loader = new mo.Loader(resList, {
		loadType : 1,
		minTime : 0,
		onLoading : function(count,total){
			var num = parseInt((count/total)*100);
			$('.loading .bar').width(num+'%');
		},
		onComplete : function(time){
			setTimeout(function() {
				$('.loading').animate({
				'opacity': 0},
				300, function() {
					$('.parallax-arrow').fadeIn(800);
					$('.loading').remove();
				});
				slider.next();
				$('.icon-arrow').show();
				
			}, 500);
		}
	});

		
	// 翻转屏幕提示
	window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
		
		detectOrientation();
	}, false);

	(function() {
		detectOrientation();
	})();

	function detectOrientation() {
		if (window.orientation === 180 || window.orientation === 0) { 
			$('.dialog-guide').hide();
		}  
		if (window.orientation === 90 || window.orientation === -90 ){  
			$('.dialog-guide').show();
		}
	}


    // Android 2.3.x 动画退化处理

	function decideAndroid23(ua) {
		ua = (ua || navigator.userAgent).toLowerCase();
		return ua.match(/android.2\.3/) ? true : false;
	}

	if( decideAndroid23() ){
		$("#page-wrapper").addClass("android23");
	}
	
	
	
	
	
});	