App = (function($){

	var init = function(){
		$.get('http://localhost:8001/starred', function(data){
			var html = '';
			for(var i = 0 ; i < data.length; i++){
				var size = 50;
				if(data[i].trackNum == 3){
					size = 200;
				}
				html += '<div style="background-image: url(' + data[i].image + '); width: '+size+'px; height: '+size+'px; display: inline-block; background-size: 100%;">' + data[i].trackNum + '</div>' ;
			}

			$('body').append(html);
		})
	}

	return {
		init: init
	}



})(jQuery);

$().ready(function(){
	App.init();
})

