$(document).ready(function() {
				
				var offsetX = -40;
				var offsetY = +20;
				
				$('#x a').mousemove(function(event) {
					$('#toolTip').html(this.name);
					$('#toolTip').css({top:event.pageY + offsetY+ "px", left: event.pageX + offsetX +"px"})
					$('#toolTip').show("fast");
				});
				
				$('#x a').mouseout(function(){
					$('#toolTip').hide("fast");
				});
});