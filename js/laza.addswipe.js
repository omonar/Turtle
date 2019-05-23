/*	
 *	addSwipe() :: Swipe gesture support
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).addSwipe( leftFn, rightFn, options );
 *	Options: treshold, oversizeTreshold, margin
		treshold: 			40,			// Considering as click instead of move
		oversizeTreshold: 	0.15,		// The proportion of screen size moving within this boundary still don't trigger prev/next action 
		margin: 			15			// Re-align to this margin, when moved over
 */
 
;(function($, $document, $window) {
	'use strict';

	$.fn.addSwipe = function(leftFn, rightFn, settings) {
		
		settings = $.extend({}, $.fn.addSwipe.defaults, settings);
														
		// Getting coordinates of a touch or mouse event
		var	getXY = function(e) {
				if (e.touches && e.touches.length === 1) {
					return [ 
						Math.round(e.touches[0].clientX),
						Math.round(e.touches[0].clientY)
					];
				} else if (e.clientX !== null) {
					return [
						Math.round(e.clientX),
						Math.round(e.clientY)
					];
				}
				return null;
			},
			
			getX = function(e) {
				if (e.touches && e.touches.length === 1) {
					return Math.round(e.touches[0].clientX);
				} else if (e.clientX !== null) {
					return Math.round(e.clientX);
				}
				return null;
			};
				
		return this.each(function() {
			
			var self = $(this),							// the element to move
				clip = self.parent(),					// clipping window
				ns = self.data('lsw_ns') ||				// namespace 
					'lsw_' + Math.floor(Math.random() * 10000),
				x0 = 0, y0 = 0,							// storing transform offset
				cw = clip.outerWidth(),					// container width, height
				ch = clip.outerHeight(),	
				ew = self.outerWidth(), 				// element width, height
				eh = self.outerHeight(),
				mx,										// max x for panoramic
				uto,									// window resize update timeout
				tt,										// touch start time
				ex0, ey0,								// event start coords
				dx, dy,									// relative move
				cax,									// constrain to x axis

				
				// Updating viewport dimensions
				
				updateClipDim = function() {
					cw = clip.outerWidth();
					ch = clip.outerHeight();
				},
				
				resetCoords = function() {
					
					x0 = self.data('tr_x') || 0;
					y0 = cax? 0 : (self.data('tr_y') || 0);
					dx = dy = 0;
				},
			
				// Starting swipe
				swipeStart = function(e) {
					//log(e.type);
					
					if (self.data('scrolling') ||
						$(e.target).closest('[data-noswipe]').length) {
						// Still scrolling or not the image itself, e.g. video player control 
						return true;
					}
					
					if (e.originalEvent.touches && e.originalEvent.touches.length > 1 ||
						e.type === 'mousedown' && e.which !== 1) {
						// multi-finger touch or right click
						return true;
					}
					
					if (e.type !== 'touchstart') {
						// Allowing long tap
						e.preventDefault();
					}
										
					var c = getXY(e.originalEvent);
					
					ex0 = c[0];
					ey0 = c[1];
					
					self.removeClass('smooth');
					self.data('scrolling', false);
					self.data('taplength', 0);
					
					tt = new Date().getTime();
					cw = cw || clip.outerWidth();
					ew = self.outerWidth();
					eh = self.outerHeight();
					cax = eh <= ch;
					mx = (ew > cw)? Math.round((ew - cw * (1 - settings.oversizeTreshold)) / 2) : 0;
					
					resetCoords();
					
					
					if (e.type === 'touchstart') {
						// touchmove can't be turned on/off 
						// because the event firing order is spoiled then
						return true;
					}
					
					// mousemove watching for mouse/pointer swipe 
					if (e.type === 'mousedown') {
						$document.on('mousemove.' + ns, swipeMove);
						$document.add(self).on('mouseup.' + ns, swipeEnd);
					} else if (e.type === 'pointerdown') {
						$document.on('pointermove.' + ns, swipeMove);
						$document.add(self).on('pointerup.' + ns, swipeEnd);
					} else if (e.type === 'MSPointerDown') {
						$document.on('MSPointerMove.' + ns, swipeMove);
						$document.add(self).on('MSPointerUp.' + ns, swipeEnd);
					}
					
					return false;
				},
				
				// Moving the element
				swipeMove = function(e) {
					//log(e.type);
					
					if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
						// multi finger touch
						return true;
					}
					
					e.preventDefault();
					
					if (cax) {
						dx = getX(e.originalEvent) - ex0;
						self.translate(x0 + dx, 0);
					} else {
						var d = getXY(e.originalEvent);
						dx = d[0] - ex0;
						dy = d[1] - ey0;
						self.translate(x0 + dx, y0 + dy);
					}
					
					self.data('scrolling', dx || dy);
					return false;
				},
				
				// Cancel swipe (e.g. moved out of the screen)
				swipeCancel = function(e) {
					//log(e.type);
					if (e.type !== 'touchcancel') {
						if (e.type === 'dragcancel') {
							$document.off('mousemove.' + ns);
							$document.add(self).off('mouseup.' + ns);
						} else {
							$document.off(TOUCH.MOVE + '.' + ns);
							$document.add(self).off(TOUCH.END + '.' + ns);
						}
					}
					
					setTimeout(function() { 
							self.data('scrolling', false);
						}, 20);
					
					self.translate(0, 0, 'smooth');
					return false;
				},
				
				// Stopped swiping
				swipeEnd = function(e) { 
					//log(e.type);
					if (e.type !== 'touchend') {
						if (e.type === 'mouseup') {
							$document.off('mousemove.' + ns);
							$document.add(self).off('mouseup.' + ns);
						} else {
							$document.off(TOUCH.MOVE + '.' + ns);
							$document.add(self).off(TOUCH.END + '.' + ns);
						}
					}
					
					var dt = (new Date().getTime() - tt);
					
					if ((Math.abs(dx) < settings.treshold) && (cax || Math.abs(dy) < settings.treshold)) {
						// No move or small move -> let the default (click, taphold) happen
						detachHandlers();
						self.data('scrolling', false);
						self.data('taplength', dt);
						
						if (dx || dy) {
							self.translate(0, 0);
						}

						attachHandlers();
						return true;
					}
					
					// Swiped
					e.preventDefault();
					self.data('scrolling', true);
					
					var tx = x0 + dx + (dx * 300 / dt),
						ty = cax? 0 : (y0 + dy + (dy * 300 / dt));
					
					self.translate(tx, ty, 'smooth');
					
					if (tx < -mx) {
						if ($.isFunction(leftFn)) {
							leftFn.call($(this)); 
						}
					} else if (tx > mx) {
						if ($.isFunction(rightFn)) {
							rightFn.call($(this));
						}
					}
					
					setTimeout(function() { 
						self.data('scrolling', false);
					}, 100);
					
					return false;
				},
				
				
				noAction = function(e) {
					e.preventDefault();
					return false;
				},
				
				// Tearing off the swipe handler
				unSwipe = function() { 
					setTimeout(function() { 
						self.data('scrolling', false);
					}, 20);
					self.removeAttr('draggable');
					detachHandlers();
				},
				
				// Detaching handlers
				detachHandlers = function() {
					self.off('.' + ns);
					$document.off('.' + ns);
					$window.off('.' + ns);
				},
				
				// Attaching handlers
				attachHandlers = function() {
					resetCoords();
					self.on(TOUCH.START + '.' + ns + ' dragstart.' + ns + ' mousedown.' + ns, swipeStart)
						.on(TOUCH.CANCEL + '.' + ns + ' dragcancel.' + ns /* + ' mouseout.' + ns*/, swipeCancel)
						.on('touchmove.' + ns + ' drag.' + ns, swipeMove)
						.on('touchend.' + ns + ' dragend.' + ns, swipeEnd);
				};
			
			// clean up events that may hang around (in theory this should never happen)
			detachHandlers();
			
			// Creating new Unique ID
			self.data('lsw_ns', ns);
			
			// Need to be updated about the window size
			$window.on('resize.' + ns, function() {
				clearTimeout(uto);
				uto = setTimeout(updateClipDim, 50);
			});
			
			// Attaching event handlers
			self.attr('draggable', 'true')
				.on('unswipe.' + ns, unSwipe)
				.on('selectstart.' + ns, noAction);
				
			attachHandlers();
			
			//self.logEvents();

		});
	};
	
	$.fn.addSwipe.defaults = {
		treshold: 			20,
		oversizeTreshold: 	0.15,
		margin: 			15
	};

})(jQuery, $(document), $(window));
