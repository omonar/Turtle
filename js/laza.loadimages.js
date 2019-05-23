/*	
 *	loadImages() :: loads images only that are visible in a container
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).loadImages( options );
 *	options:
		selector: '.cont',		// container selector
		loadClass: 'toload',	// class to mark the images still to load
		d: 80					// negative distance to boundaries that should load
 */

(function($) {
	'use strict';
	
	$.fn.loadImages = function(settings) {
		
		settings = $.extend({}, $.fn.loadImages.defaults, settings);

		return this.each(function() {
				
			var w = $(this),
				c = w.find(settings.selector).eq(0) || w.children().eq(0);
				
			//log((w.attr('class')||('#'+w.attr('id')))+'['+(w.is(':visible')?'+':'-')+'] '+c.attr('class')+'['+(c.is(':visible')?'+':'-')+']');
			if (!c.length || !w.is(':visible') || !c.is(':visible')) {
				return;
			}
			
			var i = c.find('img.' + settings.loadClass);
			
			if (!i.length) {
				return;
			}
			
			var ap = c.css('position') === 'absolute',
				cl = -( ('left' in settings)? settings.left : (c.position().left - (ap? 0 : w.scrollLeft())) ) - settings.d,
				ct = -( ('top' in settings)? settings.top : (c.position().top - (ap? 0 : w.scrollTop())) ) - settings.d,
				ol = c.offset().left,
				ot = c.offset().top,
				ww = (ap? w.width() : $(window).width()) + 2 * settings.d,
				wh = (ap? w.height() : $(window).height()) + 2 * settings.d,
				p, t, tt, tl, s, wt,
				cnt = 0;
				
			//log('Load['+i.length+'] ct:'+c.position().top+' st:'+w.scrollTop());
			i.each( function() {
				t = $(this);
				p = t.parent();
				if ((s = t.data('src'))) {
					tl = p.offset().left - ol;
					tt = p.offset().top - ot;
					/*log(tt+'('+p.outerHeight()+') in ['+ct+'-'+(ct+wh)+']?' + (((tt < (ct + wh)) && (tl < (cl + ww)) && 
						((tt + p.outerHeight()) > ct) && ((tl + p.outerWidth()) > cl))? 'YES' : 'NO') );
					*/
					if ((tt < (ct + wh)) && (tl < (cl + ww)) && 
						((tt + p.outerHeight()) > ct) && ((tl + p.outerWidth()) > cl)) {
						
						wt = $('<span>', {
							'class': 	settings.wait
						}).appendTo(p);
						
						t.hide().on('load', function() {
							$(this).fadeIn().siblings('.' + settings.wait).remove();
						}).attr({
							src: 	s
						}).removeClass(settings.loadClass);
						cnt++;
					}
					if (tt > (ct + wh) || tl > (cl + ww)) {
						// Below the window
						return false;
					}
				}
			});
			//log(cnt + ' loaded');
		});
	};

	$.fn.loadImages.defaults = {
		selector: 	'.load',
		loadClass: 	'toload',
		wait: 		'wait',
		d: 			80
	};
	
})(jQuery);
