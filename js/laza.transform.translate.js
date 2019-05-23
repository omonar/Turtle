/*
 *	Lightweight Transform utilities
 *
 */

(function($, d) {

	var TRANSFORM = (VEND === 'moz')? 'transform' : ('-' + VEND + '-transform');	
	// (VEND === 'webkit')? 'transform' : VEND[0].toUpperCase() + VEND.substring(1)
	
	$.fn.translate = function(x, y, cls) {
		return this.each(function() {
			if (cls) {                                    
				$(this).addClass(cls).data('tr_cls', cls);
			}
			this.style[TRANSFORM] = 'translate(' + (x || 0) + 'px,' + (y || 0) + 'px)';
			$(this).data({
				tr_x: 	x,
				tr_y: 	y
			});
		});
	};
	
	$.fn.translateToPos = function() {
		return this.each(function() {
			var t = $(this),
				x = t.data('tr_x') || 0, 
				y = t.data('tr_y') || 0;
			if (x || y) {
				var pos = t.position(),
					cls = t.data('tr_cls');
				if (cls) {
					t.removeClass(cls);
				}
				this.style[TRANSFORM] = 'translate(0,0)';
				t.removeData('tr_x tr_y').css({
					left: 	pos.left,
					top: 	pos.top
				});
			}
		});
	};

})(jQuery, document);