/*	
 *	addScroll() :: adds vertical scroll to a layer
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	options:
		dragMinSize: 10,
		speed: 300,
		effect: 'swing',
		disabledOpacity: 0.3,
		wheelIncr: 50,
		enableKeyboard: true,
		enableMouseWheel: true,
		refresh: 0
 */

;(function($, $document, $window, $body) {
	'use strict';

	$.fn.addScroll = function(settings) {
		
		settings = $.extend({}, $.fn.addScroll.defaults, settings);
				
		return this.each(function() {
			var to, 
				cont = $(this), 
				ns = '_las_' +  Math.floor(Math.random()*10000),
				wrap = cont.parent(), 
				sup, 
				sdn, 
				sbar, 
				shan, 
				ctrls, 
				cheight, 
				wheight, 
				scroll,
				ey = 0, 
				y0, 
				tY, 
				tT, 
				tY1, 
				speed, 
				dist, 
				min,
			
				getY = function(e) {
					ey = (e.touches && e.touches.length > 0)? e.touches[0].clientY : ((typeof e.clientY !== UNDEF)? e.clientY : ey);
					return ey; 
				},
			
				getHeights = function() {
					cheight = cont.height();
					wheight = wrap.height();
				},
				
				getTop = function() { 
					return cont.position().top; 
				},
				
				getSt = function(t) { 
					return Math.round((sbar.height() - 6) * (-((t == null)? getTop() : t)) / cheight) + 3; 
				},
				
				getSh = function() { 
					return Math.max(Math.round((sbar.height() - 6) * wheight / cheight), settings.dragMinSize); 
				},
				
				// Avoid default event
				
				noAction = function(e) {
					e.preventDefault();
					return false;
				},
				
				// Refreshing images after position change
				
				refreshImages = function(top) {
					if (typeof wrap['loadImages'] === 'function') {
						if (typeof top !== UNDEF) {
							wrap.loadImages({
								top: top
							});
						} else {
							wrap.loadImages();
						}
					}
				},
				
				// Scroll handle events
				
				dragHandle = function(e) {
					e.preventDefault();
					shan.css({
						top: Math.minMax(2, Math.round(getY(e.originalEvent) - shan.data('my')), sbar.height() - shan.height() - 2)
					}); 
					matchCnt();
					return false;
				},
				
				removeHandleEvents = function() {
					$document.off('mousemove._h' + ns + ' mouseup._h' + ns);
					$body.off('pointermove._h' + ns + ' pointerup._h' + ns);
					shan.off(TOUCH.MOVE + '._h' + ns + ' ' + TOUCH.END + '._h' + ns);
				},
				
				dragHandleStop = function(e) {
					e.preventDefault();
					removeHandleEvents();
					return false;
				},
				
				dragHandleStart = function(e) {
					if (e.type === 'mousedown' && e.which !== 1) {
						return true;
					}
					e.preventDefault();
					cont.hideAllTooltips();
					$(this).data('my', Math.round(getY(e.originalEvent)) - shan.position().top);
					if (e.type === 'mousedown') {
						$document.on('mousemove._h' + ns, dragHandle)
							.on('mouseup._h' + ns, dragHandleStop);
					} else if (e.type === 'pointerdown') {
						$body.on('pointermove._h' + ns, dragHandle)
							.on('pointerup._h' + ns, dragHandleStop);
					} else {
						shan.on(TOUCH.MOVE + '._h' + ns, dragHandle)
							.on(TOUCH.END + '._h' + ns, dragHandleStop);
					}
					return false;
				},
			
				setCtrl = function(t) {
					if (t == null) {
						t = getTop();
					}
					sup.css({
						opacity: 	t? 1 : settings.disabledOpacity
					});
					sdn.css({
						opacity: 	(t === wheight - cheight)? settings.disabledOpacity : 1
					});
				},
				
				matchScr = function() {
					var bc = cheight, 
						bw = wheight;
	
					getHeights();
					
					if (wrap.scrollTop()) {
						cont.css({
							top: 	-wrap.scrollTop()
						});
						wrap.scrollTop(0);
					}
					
					// Check if container dimensions has changed
					if (bc !== cheight || bw !== wheight) {
						
						if (cheight <= wheight) {
							// content is smaller than wrap -> No scroll needed
							cont.css({
								top: 	0
							}).off('selectstart.' + ns); 
							ctrls.hide();
						} else {
							// content is taller than wrap -> Show scroll controls
							if (cont.position().top < (wheight - cheight)) {
								cont.css({        
									top: 	wheight - cheight
								});
							}
							shan.css({
								top: 		getSt(), 
								height: 	getSh()
							});
							cont.on('selectstart.' + ns, noAction);
							ctrls.show();
							setCtrl();
						}
						
						refreshImages();
					
					}
				},
			
				matchCnt = function() { 
					cont.css({
						top: 	Math.minMax(wheight - cheight, -Math.round((shan.position().top - 3) * cheight / (sbar.height() - 6)), 0)
					}); 
					setCtrl(); 
					refreshImages();
				},
				
				animateTo = function(t) {
					clearInterval(scroll);
					
					if (wheight >= cheight) {
						return;
					}
					
					t = Math.minMax(wheight - cheight, Math.round(t), 0);
					
					shan.stop(true, false).animate({
						top: 	getSt(t)
					}, settings.speed, settings.effect);
					
					cont.stop(true, false).animate({
						top: 	t
					}, settings.speed, settings.effect, function() {
						setCtrl(t);
					});
					
					refreshImages(t);
				},
			
				scrollExtra = function() {
					dist += Math.round(speed / 20);
					
					var nY = tY1 + dist;
					
					if (nY > 0 || nY < min) {
						clearInterval(scroll);
						refreshImages();
						return;
					}
					
					cont.css({
						top: 	nY
					});
					
					shan.css({
						top: 	getSt(), 
						height: getSh()
					});
					
					speed *= 0.8;
					
					if (Math.abs(speed) < 10) {
						speed = 0;
						clearInterval(scroll);
						refreshImages();
					}
				},
			
				scrollMove = function(e) {
					//log('scrollMove ' + e.target.nodeName); 
					//e.preventDefault();
					
					if (tY) {
						var dY = getY(e.originalEvent) - tY;
						if (dY) {
							cont.data('scrolling', true);
							cont.css({
								top: 	Math.minMax(min, y0 + dY, 0)
							});
							shan.css({
								top: 	getSt(), 
								height: getSh()
							});
						}
					} else {
						tY = getY(e.originalEvent);
					}
					
					return false;
				},
				
				removeEvents = function() {
					$document.off('mousemove.' + ns + ' mouseup.' + ns);
					$body.off('pointermove.' + ns + ' pointerup.' + ns);
					cont.off(TOUCH.MOVE + '.' + ns + ' ' + TOUCH.END + '.' + ns);
				},
				
				scrollStop = function(e) {
					
					cont.removeClass('scrolling');
					removeEvents();
					
					tY1 = getTop();
					
					var dY = ((e.type === 'mouseup')? getY(e.originalEvent) : ey) - tY,
						dT = new Date().getTime() - tT;
					
					if (Math.abs(dY) < 5 || dT < 20) {
						// Probably a click
						cont.data('scrolling', false);
						var a = $(e.target).closest('a');
						if (a.length) {
							if (a.attr('href')) {
								a[0].click();
							} else {
								a.trigger('click');
							}
						}
						return true;
					}
					
					// Scroll
					e.preventDefault();
					speed = 1000 * dY / dT;
					scroll = setInterval(scrollExtra, 50);
					setTimeout(function() {
						cont.data('scrolling', false);
						//$(e.target).closest('a').off('click.' + ns);
					}, 30);
				
					refreshImages();
					
					return false;
				},
			
				scrollStart = function(e) { // idea from quirsksmode.org
					if (e.type === 'mousedown' && e.which !== 1) {
						return true;
					}
					
					var n = e.target.nodeName;
					
					if (n === 'INPUT' || n === 'TEXTAREA' || n === 'BUTTON' || n === 'SELECT') {
						// no scroll on input elements
						return true;
					}
					
					if (settings.dontDrag && 
						($(e.target).is(settings.dontDrag).length || 
							$(e.target).parents(settings.dontDrag).length)) {
						// exception (e.g. map)
						return true;
					}
					
					if (cont.data('scrolling')) {
						// recursive call
						scrollStop(e);
						return true;
					}
					
					if ((e.target.scrollHeight - 1) > e.target.clientHeight) {
						// inner scrollable element
						return true;
					}
					
					if (wheight >= cheight ||
						(e.type === 'touchstart' && 
							(!e.originalEvent.touches || 
								e.originalEvent.touches.length > 1 || 
								cont.is(':animated')))) {
						// Too low to scroll or multi-finger gesture
						return true;
					}
					
					//e.preventDefault();
					removeEvents();
					$(e.target).closest('[data-tooltip-id]').trigger('removetooltip');
					cont.data('scrolling', true);
					//$(e.target).closest('a').on('click.' + ns, avoidClick);
					//log($(e.target).closest('a')[0].href)
					
					shan.stop(true, true);
					cont.stop(true, true);
					clearInterval(scroll);
					
					// te = e; ?
					y0 = getTop();
					tY = getY(e.originalEvent);
					tT = new Date().getTime();
					dist = 0;
					min = wheight - cheight;
					//log('dragStart:'+y0);
					
					cont.hideAllTooltips();
					cont.addClass('scrolling');
				
					if (e.type === 'mousedown') {
						$document.on('mousemove.' + ns, scrollMove)
							.on('mouseup.' + ns, scrollStop);
					} else if (e.type === 'pointerdown') {
						$body.on('pointermove.' + ns, scrollMove)
							.on('pointerup.' + ns, scrollStop);
					} else {
						cont.on(TOUCH.MOVE + '.' + ns, scrollMove)
							.on(TOUCH.END + '.' + ns, scrollStop);
					}
					
					return false;
				},
				
				// Initializing
				
				init = function() {
					
					cont.css({
						position: 	'absolute', 
						width: 		wrap.width - 20
					});
			
					wrap.css({
						overflow: 	'hidden'
					});
					
					if (wrap.css('position') !== 'absolute') {
						wrap.css({ 
							position: 'relative' 
						});
					}
					
					sup = $('<div>', { 
						'class': 	settings.upbtn 
					}).appendTo(wrap);
					
					sdn = $('<div>', { 
						'class': 	settings.dnbtn 
					}).appendTo(wrap);
					
					sbar = $('<div>', { 
						'class': 	settings.scbar 
					}).appendTo(wrap);
					
					shan = $('<div>').appendTo(sbar);
					ctrls = sup.add(sdn).add(sbar);
					ctrls.hide();
					ctrls.on('selectstart.' + ns, noAction); 
					
					sup.on('click.' + ns, function() { 
						cont.hideAllTooltips();
						animateTo(getTop() + wheight); 
						return false; 
					});
					
					sdn.on('click.' + ns, function() {
						cont.hideAllTooltips();
						animateTo(getTop() - wheight); 
						return false; 
					});
					
					sbar.on('click.' + ns, function(e) {
						cont.hideAllTooltips();
						var y = getY(e.originalEvent);
						if (y < shan.offset().top) {
							animateTo(getTop() + wheight);
						} else if (y > (shan.offset().top + shan.height())) {
							animateTo(getTop() - wheight);
						}
						return false;
					});
			
					shan.attr('draggable', 'true')
						.on(TOUCH.START + '.' + ns + ' dragstart.' + ns + ' mousedown.' + ns, dragHandleStart);
					
				},
			
				// Move active element into view
				
				setactive = function() {
					if (cont.data('scrolling')) {
						return;
					}
					
					var e = ($(this).parent() === cont)? $(this) : $(this).parent(),
						et = e.position().top, 
						eh = e.outerHeight(true),
						ct = cont.position().top,
						wh = wrap.height();
					
					if (wh > cont.height()) {
						return;
					} else if ((et + eh) > (wh - ct)) {
						ct = Math.max(wh - eh - et, wh - cont.height());
					} else if (et < -ct) {
						ct = -et;
					} else { 
						return;
					}
					
					animateTo(ct);
				},
				
				// Avoid click events during drag
				
				avoidClick = function(e) {
					//log(e.target.nodeName + ':' + cont.attr(settings.dragOn));
					if (cont.data('scrolling')) {
						e.preventDefault();
						return false;
					}
					return true;
				};
			
			// Initializing
			
			init();
			cont.on('click.' + ns, 'a', avoidClick);
			
			//cont.logEvents();
			//cont.find('img').logEvents();
			
			cont.css('touch-action', 'none')
				.data('scrolling', false)
				.attr({
					'draggable':			true,
					'data-custom-scroll': 	true,
					'data-role':			'scroll'
				})
				.on(TOUCH.START + '.' + ns + ' dragstart.' + ns + ' mousedown.' + ns, scrollStart);
			
			// Auto adjust on window resize 
			
			$window.on('resize.' + ns, function() { 
				clearTimeout(to); 
				to = setTimeout(matchScr, 50);
			});
			
			to = setTimeout(matchScr, 10);
			cont.on('adjust', matchScr);
			
			// Automatic match for changing content, e.g. comment box
			
			if (settings.refresh) {
				setInterval(function() {
					if (!$('[data-role=gallery]').is(':visible')) {
						matchScr();
					}
				}, settings.refresh);
			}
			
			// Set active element event
			
			if (settings.focusActive) {
				cont.find('a').on('setactive', setactive);
			}
			
			// Mouse wheel handler
			
			if (settings.enableMouseWheel) {
				cont.on('mousewheel.' + ns, function(e, d) {
					if (d) {
						clearTimeout(scroll);
						shan.stop(true, true);
						cont.stop(true, true);
						animateTo(getTop() + settings.wheelIncr * ((d < 0)? -1 : 1));
					}
					return false;
				});
			}
			
				
			// Keyboard handler
			
			if ($.isFunction(settings.enableKeyboard) || settings.enableKeyboard) {
				$document.on('keydown.' + ns, function(e) {
					if (document.activeElement && document.activeElement.nodeName === 'INPUT' || 
						($.isFunction(settings.enableKeyboard) && !settings.enableKeyboard())) {
						return true;
					}
					var k = e? e.keyCode : window.event.keyCode;
					switch( k ) {
						case 33: 
							e.preventDefault();
							animateTo(getTop() + wheight); 
							return false;
						case 34: 
							e.preventDefault();
							animateTo(getTop() - wheight); 
							return false;
					}
					return true;
				});
			}
		});
	};
	
	$.fn.addScroll.defaults = {
		upbtn: 				'scrup',
		dnbtn: 				'scrdn',
		scbar: 				'scrbar',
		dragMinSize: 		10,
		speed: 				300,
		effect: 			'swing',
		disabledOpacity: 	0.3,
		wheelIncr: 			50,
		enableKeyboard: 	true,
		enableMouseWheel: 	true,
		focusActive: 		true,
		refresh: 			0
	};
	
})(jQuery, $(document), $(window), $('body'));
