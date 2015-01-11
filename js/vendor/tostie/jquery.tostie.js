$.fn.tostie = function(options) {
	var opts = $.extend( {}, $.fn.tostie.defaults, options );
	var inOutType = "";
	
	switch(opts.inOutType){
		case "fade":
			inOutType = "fade";
			break;
		default:
		case "slide":
			inOutType = "slide";
			break;
	}
	
	switch(opts.type){
		case "success":
			type = "success";
			break;
		case "error":
			type = "error";
			break;
		case "warning":
			type = "warning";
			break;
		default:
		case "notice":
			type = "notice";
			break;
	}

	var $elem = $('.tostie-toast');
	var removeMessage = function(){
		opts.beforeClose();
		var removeFunction = function(){
			msgDiv.remove();
			opts.afterClose();
		};
		if(inOutType == "slide"){
			msgDiv.slideUp(opts.inOutDuration, removeFunction);
		}
		else if(inOutType == "fade"){
			msgDiv.fadeOut(opts.inOutDuration, removeFunction);
		}
	};
	if($elem.length == 0){
		$elem = $('<div class="tostie-toast"></div>');
		$('body').prepend($elem);
	}
	
	var msgDiv = $('<div class="'+type+'"><a href="" class="toast-close">'+opts.message+'</a></div>');
	msgDiv.css({display:'none'});
	$elem.append(msgDiv);
	
	if(inOutType == "slide"){
		msgDiv.slideDown(opts.inOutDuration);
	}
	else if(inOutType == "fade"){
		msgDiv.fadeIn(opts.inOutDuration);
	}
	
	setTimeout(function(){
		removeMessage();
	}, opts.toastDuration);
	msgDiv.find(".toast-close").click(function(){
		removeMessage();
		return false;
	});
};

$.fn.tostie.defaults = {
	message: "",
	type: "notice",
	toastDuration: 3000,
	inOutDuration: 300,
	inOutType: "slide",
	beforeClose: function(){},
	afterClose: function(){}
};