/*	
 *	addTooltip() :: little Popup displaying 'title' text, or passed text (can be HTML)
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).addTooltip( [txt,] options );
 *	options:
		id: 	'tooltip',
		stay: 	3000,
		posX: 	ALIGN_CENTER,
		posY: 	ALIGN_BOTTOM,
		toX: 	ALIGN_CENTER,
		toY: 	ALIGN_TOP
 */

;(function($) {
	'use strict';
			
	$.fn.hideAllTooltips = function() {
		return this.each(function() {
			$(this).find('[data-tooltip-id]').each(function() {
				var id = $(this).attr('data-tooltip-id');
				if (id && id.length) {
					$('#' + id).hide();
				}
			});
		});
	};
	
	$.fn.destroyAllTooltips = function() {
		return this.each(function() {
			$(this).find('[data-tooltip-id]').each(function() {
				var id = $(this).attr('data-tooltip-id');
				if (id && id.length) {
					$('#' + id).remove();
				}
			});
		});
	};
	
	$.fn.addTooltip = function(content, settings) {
		
		if (typeof content !== UNDEF && typeof content !== 'string' && !content.jquery) {
			settings = content;
			content = null;
		}
		
		settings = $.extend({}, $.fn.addTooltip.defaults, settings);
		
		//console.log(content || $(this).data('tooltip') || $(this).attr('title'));
		
		var createNew = function(el, cont) {
				var c;
								
				if (!cont) {
					
					if (cont = el.data('tooltip')) {
						// read from related layer
						if (cont.charAt(0) === '.') {
							cont = el.find(cont).eq(0);
						} else if (cont.charAt(0) === '#') {
							cont = $(cont);
						}
						if (cont.jquery) {
							cont.removeClass('hidden');
						}
					} else {
						// read from data or title attr
						cont = el.attr('title');
						el.removeAttr('title');
					}
					
					if (!cont || !cont.length) {
						return null;
					}
					
					c = $('<div>', {
						html: 	cont
					}).appendTo('body');
					
				} else if (typeof cont === 'string') {
					
					// passed directly :: html structure as string
					c = $('<div>', {
						html: 	cont
					}).appendTo('body');
					
				} else if (cont.jquery) {
					
					// jQuery element
					if (!$.contains(document.body, cont[0])) {
						c = cont.appendTo('body');
					} else {
						c = cont;
					}
					
				} else {
					return null;
				}
				
				if (c.is(':empty')) {
					return null;
				}
				
				c.attr('id', el.attr('data-tooltip-id'))
					.addClass(settings.className)
					.attr('role', 'tooltip')
					.attr('aria-hidden', true)
					.hide()
					.append($('<span>', {
						'class': 	settings.nub
					}));
				
				return c;
				
			};
		
		return this.each(function() {
			
			if (this['data-tooltip-id']) {
				return true;
			}
			
			var self = $(this), 	// trigger element
				tt,					// tooltip layer
				to, 				// show timeout
				hto,				// hide timeout
				over = false,		// over the tooltip 
				focus = false,		// tooltip input got focus
				offs,				// last offset
				start,				// event start
				events = '',		// cumulating events
				wasOn = false,		// was on at the beginning of the event?
				ns = '_ltt_' + Math.floor(Math.random()*10000),
				isFireFox = /(Firefox\/\d+)/.test(navigator.userAgent),
					
				// Create
				create = function() {
					
					if (!(tt = createNew(self, content))) {
						return false;
					}
					
					// Keep the popup live while the mouse is over
					tt.on('mouseover.' + ns, getFocus)
						.on('mouseout.' + ns, lostFocus);
							
					// ... or an input box has focus
					tt.find('input, textarea').on('focus.' + ns, function() {
						focus = true;
						getFocus();
					}).on('blur.' + ns, function() {
						focus = false;
					});
					
					return true;
				},
				
				// getFocus
				getFocus =  function(e) {
					//log(e.type + ' :: Getting focus');
					hto = clearTimeout(hto);
					over = true;
					tt.finish().show();
				},
				
				// lostFocus
				lostFocus = function(e) {
					//log(e.type + ' :: Losing focus');
					if (focus) {
						return;
					}
					clearTimeout(hto);
					over = false;
					hto = setTimeout(hide, 100);
				},
					
				// Hiding the popup
				hide = function() {
					to = clearTimeout(to);
					hto = clearTimeout(hto);
					over = false;
					events = '';
					if (tt) {
						tt.stop(true, false).fadeOut(200, function() { 
							tt.hide();
						});
					}
				},
				
				// Hide later :: automatically on touch devices
				hideLater = function() {
					clearTimeout(hto);
					hto = setTimeout(hide, settings.stay);
				},
				
				
				// Showing, aligning and fading in
				show = function() {
					var o = self.offset();
					//log(o.left + ':' + o.top);
					/*if (events === '.focus' || events === '.mouseenter') { 
						events = '';
					}*/
					if (!offs) {
						offs = o;
					}
					
					if (o.top === offs.top && o.left === offs.left) {
						// only if target layer not in move
						tt.fadeIn(300).alignTo(self, {
							gap: 	10,
							pos: 	settings.pos
						});
					}
					
					setTimeout(function() {
						events = '';
					}, 1000);
				},
				
				// Leaving the trigger element
				leave = function(e) {
					//log(e.type + ' :: Leaving spot');
					if (events.indexOf(TOUCH.START) === -1) {
						hto = setTimeout(hide, 100);
					} else {
						hto = setTimeout(hide, 8000);
					}
				},
				
				// Avoid Click
				avoidClick = function(e) {
					e.preventDefault();
					to = clearTimeout(to);
					hto = clearTimeout(hto);
				},
				
				ttVisible = function() {
					return !!tt && tt.is(':visible') && (tt.css('opacity') > 0.99);
				},
				
				// Test for link
				hasLink = function(el) {
					var	a = el.closest('a');
					return a.length && a.attr('href') && !a.attr('href').startsWith('javascript');
				},
				
				// The hotspot clicked
				clicked = function(e) {
					//log(e.type + ' :: Clicked spot');
					//log(events);
					to = clearTimeout(to);
					if (events.indexOf(TOUCH.START) !== -1 || isFireFox) {
						// touched
						// Firefox by default emulates touch events with mouse events, 
						// no way you can tell the difference, so it's safer to treat like touch
						
						var now = new Date();
						if (settings.touchToggle || now - start > 1000) {
							// touch toggle or long touch
							//log('Touched for ' + (now-start) + 'ms');
							//log('wasOn='+wasOn+' hasLink()='+hasLink($(e.target))+' visible='+ttVisible());
							if (hasLink($(e.target)) && ttVisible()) {
								// Link and tt is visible :: let click it
								return true;
							} else {
								// No link or need to toggle on first
								avoidClick(e);
								if (wasOn) {
									hide();
								} else {
									show();
								}
								return false;
							}
						}		
					}
					
					if (wasOn) {
						hto = clearTimeout(hto);
						hide();
					}
					
					events = '';
					over = false;
					return true;
					/*
					var a = $(e.target).closest('a');
					if (a.length) {
						var l = a.attr('href');
						if (l.length && !l.startsWith('javascript:')) {
							//a.off('click.' + ns);
							a[0].click();
						} else {
							a.trigger('click');
						}
					}
					*/
				},
				
				// Entering the hotspot
				enter = function(e) {
					//log(e.type + ' :: Entering spot');
					var now = new Date();
					
					if (events) {
						if (events.indexOf(e.type) === -1) {
							events += '.' + e.type;
						}
					} else {
						events = '.' + e.type;
						wasOn = ttVisible();
						start = now;
						offs = self.offset();
					}
					
					if (!tt) {
						if (!create()) {
							destroy();
							return true;
						}
					} else {
						tt.stop(true, false);
						hto = clearTimeout(hto);
					}
					
					clearTimeout(to);
					
					if (e.type !== TOUCH.START) {
						// The events that won't trigger click
						to = setTimeout(show, settings.delay);
					}
					return true;
				},
				
				destroy = function(e) {
					self.off('.' + ns);
					to = clearTimeout(to);
					hto = clearTimeout(hto);
					$('#' + self.attr('data-tooltip-id')).remove();
					self.attr('data-tooltip-id', null);
				};
					
			
			// Force removing the tooltip
			self.attr('data-tooltip-id', ns)
				.on('destroyTooltip', destroy)
				.on('removeTooltip', hide)
				.on('focus.' + ns + ' mouseenter.' + ns + ' ' + TOUCH.START + '.' + ns, enter)
				.on('blur.' + ns + ' mouseleave.' + ns, leave)
				.on('click.' + ns, clicked);
			
		});
	};
	
	/*	pos:
		ALIGN_LEFT = ALIGN_TOP = 0
		ALIGN_CENTER = ALIGN_MIDDLE = 1
		ALIGN_RIGHT = ALIGN_BOTTOM = 2
	*/
	$.fn.addTooltip.defaults = {
		delay: 			50,
		className: 		'tooltip',
		nub: 			'nub',
		stay: 			2000,
		touchToggle:	false,
		pos: 			[1,2,1,0]
	};
	
})(jQuery);
