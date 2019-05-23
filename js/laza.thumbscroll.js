/*	
 *	thumbScroll() :: adds horizontal scrolling to layer
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).thumbScroll( options );
 *	options:
		speed: 1500,
		incr: 100,
		effect: 'easeOutBack',
		headRoom: 0.67,
		disabledOpacity: 0.3,
		enableMouseWheel: true
 */

(function($, $document, $window) {
	'use strict';
	
	$.fn.scrollThumbs = function(settings) {
		
		settings = $.extend( {}, $.fn.scrollThumbs.defaults, settings );
				
		return this.each(function() {
			var co = $(this), 
				ns = '_lts_' + Math.floor(Math.random()*10000),
				wr = co.parent(),
				ex = 0, 
				x0, 
				tX, 
				tT, 
				tX1, 
				speed, 
				dist, 
				min, 
				scroll, 
				seek,
				
				getX = function(e) {
					ex = (e.touches && e.touches.length === 1)? e.touches[0].clientX : ((typeof e.clientX !== UNDEF)? e.clientX : ex);
					return ex;
				},
				
				noAction = function(e) {
					e.preventDefault();
					return false;
				},
				
				scleft = $('<div>', { 
					'class': settings.scleft 
				}).insertAfter(wr),
				
				scright = $('<div>', { 
					'class': settings.scright 
				}).insertAfter(wr),
										
				setCtrl = function( x ) {
					x = (x == null)? co.position().left : x;
					scleft.css({ 
						opacity: (x < 0)? 1 : settings.disabledOpacity 
					});
					scright.css({ 
						opacity: (wr.width() < (x + co.width()))? 1 : settings.disabledOpacity 
					});
				},
				
				animateTo = function( x ) {
					var w = wr.width(), c = co.width();
					
					if (!w || !c || w >= c || !$.isNumeric(x)) {
						return;
					} else if (x > 0) {
						x = 0;
					} else if (x < w - c) {
						x = w - c;
					}
					
					setCtrl(x);
					co.stop(true, false);
					clearInterval(scroll);
					
					co.animate( { 
						left: 	x 
					}, settings.speed, settings.effect);
					
					wr.loadImages({
						left: 	x
					});
					
				},	
			
				scrollLeft = function(e) {
					e.preventDefault();
					seekOn();
					animateTo(co.position().left + wr.width()); 
					return false; 
				},
				
			
				scrollRight = function(e) {
					e.preventDefault();
					seekOn();
					animateTo(co.position().left - wr.width()); 
					return false; 
				},
				
				// User performs a seek - don't move active into view
				
				seekOn = function(state) {
					if (typeof seek === 'number') {
						clearTimeout(seek);
					}
					if (typeof state !== 'undefined') {
						seek = state;
					} else {
						seek = setTimeout(function() {
							seek = false;
						}, settings.seekStay);
					}
				},
			
				setactive = function() {
					if (co.data('scrolling') || seek) {
						return;
					}
					
					var e = co.find(settings.active).closest('li');
					
					if (e.length) {
						var el = e.position().left, 
							ew = e.outerWidth(true),
							hr = Math.round(ew * settings.headRoom),
							cl = co.position().left,
							ww = wr.width();
						
						if ( ww > co.width() ) {
							return;
						} else if (el > (ww - ew - hr - cl)) {
							cl = Math.max(ww - ew - hr - el, ww - co.width());
						} else if (el < -cl + hr) {
							cl = -el + hr;
						} else { 
							return;
						}
						
						animateTo(cl);
					}
				},
			
				mousewheel = function(e, d) {
					e.preventDefault();
					if (d) {
						co.stop(true, false);
						clearInterval(scroll);
						seekOn();
						animateTo(co.position().left + wr.width() * ((d < 0)? -1 : 1));
					}
					return false;
				},

				dragExtra = function() {
					dist += Math.round(speed / 20);
					var nX = tX1 + dist;
					if (nX > 0 || nX < min) {
						clearInterval(scroll);
						return;
					}
					co.css({
						left: nX
					});
					speed *= 0.8;
					if (Math.abs(speed) < 10) {
						speed = 0;
						clearInterval(scroll);
					}
				},
			
				dragMove = function(e) {
					//e.preventDefault();
					if (tX) {
						var dX = getX(e.originalEvent) - tX;
						if (dX) {
							co.data('scrolling', true);
							co.css({
								left: Math.minMax(min, x0 + dX, 0)
							});
						}
					} else {
						tX = getX(e.originalEvent);
					}
					return false;
				},
			
				dragStop = function(e) {
					e.preventDefault();
					
					tX1 = co.position().left;
					
					var dX = getX(e.originalEvent) - tX,
						dT = new Date().getTime() - tT;
					
					speed = 1000 * dX / dT;
					scroll = setInterval(dragExtra, 50);
					seekOn();
					
					if (e.type === 'mouseup') {
						$document.off('mousemove.' + ns)
							.off('mouseup.' + ns);
					} else {
						co.off(TOUCH.MOVE + '.' + ns)
							.off(TOUCH.END + '.' + ns);
					}
					if (Math.abs(dX) < 10) {
						// No dragging: trigger click
						co.data('scrolling', false);
						$(e.target).off('click.' + ns);
						$(e.target).closest('a').trigger('click', e);
					} else {
						wr.loadImages({
							left: x0 + dX * 2
						});				
						// Delay 30ms after a dragging
						setTimeout(function(){
							co.data('scrolling', false);
							$(e.target).off('click.' + ns);
						}, 30);
					}
					
					return false;
				},
			
				dragStart = function(e) {
					if (e.type === 'mousedown' && e.which !== 1) {
						return true;
					}
					e.preventDefault();
					
					if (e.type === 'touchstart' && 
						(!e.originalEvent.touches || e.originalEvent.touches.length > 1 || 
							co.is(':animated'))) {
						return true;
					}
					
					co.stop(true, false);
					clearInterval(scroll);
					
					seekOn(true);
					
					x0 = co.position().left;
					tX = getX(e.originalEvent);
					tT = new Date().getTime();
					dist = 0;
					min = wr.width() - co.width();
					
					if (min >= 0) {
						return true;
					}
					
					if (e.type === 'mousedown') {
						$document.on('mousemove.' + ns, dragMove)
							.on('mouseup.' + ns, dragStop);
						$(e.target).on('click.' + ns, noAction);
					} else {
						$(e.target).closest('a').focus();
						co.on(TOUCH.MOVE + '.' + ns, dragMove)
							.on(TOUCH.END + '.' + ns, dragStop);
					}
					
					return false;
				};
			
			if (settings.enableMouseWheel) {
				co.on('mousewheel', mousewheel);
			}
			
			setCtrl();
			
			co.on('setactive', setactive);
			
			// Scroll left and right buttons
			scleft.on('click.' + ns, scrollLeft);
			scright.on('click.' + ns, scrollRight);
			
			// Wiring drag start event
			co.on(TOUCH.START + '.' + ns + ' mousedown.' + ns, dragStart);
			
			co.attr({
					'data-role':			'scroll',
					'data-custom-scroll':	true
				})
				.data('scrolling', false);
				
			co.add(scleft).add(scright).on('selectstart.' + ns, noAction);
			
			wr.loadImages();
									
		});
	};
	
	$.fn.scrollThumbs.defaults = {
		active: 			'.active',
		scleft: 			'scleft',
		scright: 			'scright',
		seekStay: 			3000,
		speed: 				1500,
		incr: 				100,
		effect: 			'swing',
		headRoom: 			0.67,
		disabledOpacity: 	0.3,
		enableMouseWheel: 	true
	};

})(jQuery, $(document), $(window));
