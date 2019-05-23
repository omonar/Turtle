/*	
 *	addModal() :: adding modal window to any layer (typically 'body')
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).addModal( content, buttons, options );
 *		content = text or jQuery element [required]
 *		buttons = [ { 
 *			t: 'string',		// title 
 *			h: function(){}		// handler
 *		} , ... ] [optional]
 *		options = 
		uid:							// unique identifier, will be used as <div id="">
		title:							// the title of the window displayed in the header
		speed: 250,						// transition speed in ms
		autoFade: 0,					// automaticcaly disappearing after X ms, 0 = remain
		width: 400,						// default width
		resizable: false,				// user can resize the window
		enableKeyboard: true,			// enable button selection with keyboard (left, right, enter, esc)
		closeOnClickOut: true,			// closing the modal window on clicking outside the window
		closeWindow: 'Close window',	// 'close window' tooltip text
		okButton: 'okButton',			// adds a default OK button, which closes the modal when clicked
		darkenBackground: true,			// darken the background behind the window
		savePosition: true,				// save window position and size and re-apply fot the windows with the same 'uid'
		pad: 6,							// padding to the edges
		type: 'normal'					// 'normal' | 'question' | 'message' | 'warning' | 'error'
 */

;(function($, $document, $window) {
	'use strict';
	
	$.fn.addModal = function(content, buttons, settings) {
		
		if (typeof content === 'string') {
			content = $(content);
		}
		
		if (!(content instanceof $ && content.length)) {
			return;
		}
				
		if (!$.isArray(buttons)) { 
			settings = buttons; 
			buttons = null;
		}
		
		settings = $.extend( {}, $.fn.addModal.defaults, settings );
		settings.savePosition = settings.savePosition && ('uid' in settings);
		
		var self = $(this),
			text = getTranslations($.fn.addModal.text),
			ns = '_lmo_' + Math.floor(Math.random()*10000),
			id = {
				w: 	'_m_window',
				p: 	'_m_panel',
				h: 	'_m_head',
				c: 	'_m_cont',
				ci: '_m_cont_i',
				x: 	'close',
				r: 	'resize'
			},
			// $ elements
			w, p, h, x, c, ci,
			// container dimensions
			ww, wh,
			// diff in height between the whole window and the content
			dh = 0,
			// to = timeout for autoFade
			to,
			
			// Getting coordinates of a touch or mouse event
			 
			getCoords = function(e) {
				
				if (e.touches && e.touches.length === 1) {
					return { 
						x: Math.round(e.touches[0].clientX),
						y: Math.round(e.touches[0].clientY)
					};
				} else if (e.clientX !== null) {
					return {
						x: Math.round(e.clientX),
						y: Math.round(e.clientY)
					};
				}
				
				return null;
			},
			
			// Maintaining container dimensions
		
			updateDimensions = function() {
				ww = self.width();
				wh = self.height();
			},
		
			// Drag moving
			
			dragStart = function(e) {
				
				if (e.target.nodeName === 'A' || 
					e.type === 'mousedown' && e.which !== 1 || 
					p.is(':hidden')) {
					return true;
				}
				
				e.preventDefault();
				
				var x0 = p.position().left, 
					y0 = p.position().top,
					ec0 = getCoords(e.originalEvent),
					lm = ww - p.width() - settings.pad,
					tm = wh - p.height() - settings.pad,
					oc = h.css('cursor');
				
				x.trigger('removeTooltip');
				
				h.css({
					cursor: 	'move'
				});
				
				var dragMove = function(e) {
					
					e.preventDefault();
					var ec = getCoords(e.originalEvent);
					
					p.css({
						left: 	Math.minMax( settings.pad, x0 + ec.x - ec0.x, lm ),
						top: 	Math.minMax( settings.pad, y0 + ec.y - ec0.y, tm )
					});
					return false;
				};
				
				var dragStop = function(e) {
					
					e.preventDefault();
					if (e.type === 'mouseup') {
						$document.off('mousemove.' + ns)
							.off('mouseup.' + ns);
					} else {
						h.off(TOUCH.MOVE + '.' + ns)
							.off(TOUCH.END + '.' + ns);
					}
					
					h.css('cursor', oc);
					
					if (settings.savePosition) {
						savePosition();
					}
					
					return false;
				};
				
				if (e.type === 'mousedown') {
					$document.on('mousemove.' + ns, dragMove)
						.on('mouseup.' + ns,dragStop);
				} else {
					h.on(TOUCH.MOVE + '.' + ns, dragMove)
						.on(TOUCH.END + '.' + ns, dragStop);
				}
				
				return false;
			},
			
			// Create new
			
			createNew = function() {
				
				w = $('<div>', {
					'class':	 		id.w,
					role: 				'dialog',
					'data-role':		'dialog',
					'aria-hidden': 		true,
					'aria-labelledby': 	id.h
				}).css({
					opacity: 			0
				}).appendTo(self);
				
				self.css({
					position: 			'relative'
				});
				
				updateDimensions();

				// Darken background
				
				if (settings.darkenBackground) {
					w.addClass('darken');
				}
				
				// Panel
				
				p = $('<div>', {
					id: 			settings.uid || ns,
					'class': 		id.p + ' ' + settings.type
				}).css({
					width: 			settings.width
				}).appendTo(w);
							
				// Header
				
				h = $('<header>', {
					'class': 		id.h
				}).appendTo(p);
				
				h.append($('<h5>', {
					id: 			id.h,
					text: 			settings.title || ((settings.type === 'error' || settings.type === 'warning')? text[settings.type] : '')
				}));
				
				if (settings.type === 'error' || settings.type === 'warning') {
					h.append($('<span>', {
						'class': 	settings.type,
						text: 		'!'
					}));
				}
				
				// Close button
				
				x = $('<a>', {
					'class': 	id.x,
					html: 		'&times;'
				}).appendTo(h);
				
				x.addTooltip(text.closeWindow);				
				x.on('click.' + ns, closePanel);
		
				// Closing by clicking outside the window
				
				if (settings.blocking && settings.closeOnClickOut) {
					w.one('click.' + ns, function(e) {
						if ($(e.target).hasClass(id.w)) {
							return closePanel(e);
						}
					});
				}
				
				// Moving
				
				if (settings.movable) {
					h.on(TOUCH.START + '.' + ns +' mousedown.' + ns, dragStart);
				}
			},
			
			// Close action
			
			closePanel = function(e) {
				if (e) {
					e.preventDefault();
				}
				x.trigger('removeTooltip');
				to = clearTimeout(to);
				w.animate({
						opacity: 	0
					}, settings.speed, function() {
						w.remove();
					});
				return false;
			},
		
		
			// Adding content
			
			addContent = function(cnt) {
				// inside a wrap element
				
				c = $('<div>', {
					'class': 	id.c
				}).appendTo(p);
				
				ci = $('<div>', {
					'class': 	id.ci
				}).append(cnt).appendTo(c);
			},
			
			
			// Add buttons
			
			addButtons = function() {
			
				var	select = function(n) { 
						btns.each(function(i) { 
							$(this).toggleClass('active', i === n); 
						}); 
					},
					
					close = function() {
						$document.off('keydown.' + ns);
						closePanel();
					},
		
					keyhandler = function(e) {
						if (document.activeElement && document.activeElement.nodeName === 'input' || 
							($.isFunction(settings.enableKeyboard) && !settings.enableKeyboard())) {
							return true;
						}
						
						var k = e? e.keyCode : window.event.keyCode;
						
						if (k === 27) {
							close();
							return false;
						} else if (btn) {
							var a = btn.find('a.active'), 
								i = btns.index(a);
							switch (k) {
								case 13: 
								case 10: 
									if ($.isFunction(a[0].handler)) {
										if (a[0].handler.call(w) !== false) {
											close();
										}
									}
									break;
								case 39: 
									select((i + 1) % btns.length); 
									break;
								case 37: 
									select(i? (i - 1) : (btns.length - 1));
									break;
								default:
									return true;
							}
							return false;
						}
						return true;
					},
		
					clickhandler = function(e) {
						e.preventDefault();
						var a = e.target;
						if ($.isFunction(a.handler)) {
							if (a.handler.call(w, p) !== false) {
								close();
							}
						}
						return false;
					};
					
				if (!buttons) {
					
					if (settings.defaultButton) {
						// Default button
						buttons = [{
							t: settings.defaultButton,
							h: closePanel
						}];
					}
					
				} else {
					
					// Dialog panel (has buttons)
					var i, 
						a, 
						btns, 
						btn = $('<div>', { 
							'class': 'buttons' 
						}).appendTo(ci);
											
					for (i = 0; i < buttons.length; i++) {
						
						if (i) {
							btn.append(' ');
						}
						
						a = $('<a>', { 
							html: buttons[i].t
						}).on('click.' + ns, clickhandler).appendTo(btn);
						
						if ($.isFunction(buttons[i].h)) {
							a[0].handler = buttons[i].h;
						}
					}
					
					btns = btn.children('a');
					btns.last().addClass('active');
					
					if ($.isFunction(settings.enableKeyboard) || settings.enableKeyboard) {
						$document.on('keydown.' + ns, keyhandler);
					}
				}
			},
		
			// placing the window at given position
			
			alignPanel = function() {
							
				var pw = p.width(),
					ph = p.height();
				
				dh = ph - ci.height();
				
				if (pw && ph && ww && wh) {
					
					if (pw + 2 * settings.pad > ww) {
						p.css({
							width: pw = ww - 2 * settings.pad
						});
					}
					
					if (ph + 2 * settings.pad > wh) {
						p.css({
							height: ph = wh - 2 * settings.pad
						});
						ci.css({
							height: wh - 2 * settings.pad - dh
						});
					}
					
					p.css({
						left: Math.max( Math.round((ww - pw) * settings.pos[0] / 2), settings.pad ),
						top: Math.max( Math.round((wh - ph) * settings.pos[1] / 2), settings.pad )
					});
					
				}
			},
			
			// placing the window at a given position
			
			placePanel = function( pos ) {
				
				var l = Math.minMax(settings.pad, parseInt(pos[0], 10), ww - settings.pad - 60),
					t = Math.minMax(settings.pad, parseInt(pos[1], 10), wh - settings.pad - 60),
					pw = Math.minMax(120, parseInt(pos[2], 10), ww - l - settings.pad),
					ph;
					
				if (isNaN(l) || isNaN(t) || isNaN(pw)) {
					alignPanel();
				}
	
				dh = h.outerHeight() + 
					parseInt(c.css('padding-top'), 10) + 
					parseInt(c.css('padding-bottom'), 10) + 
					parseInt(ci.css('padding-top'), 10) + 
					parseInt(ci.css('padding-bottom'), 10) + 
					parseInt(c.css('border-top-width'), 10);
	
				p.css({ 
					position: 	'absolute',
					left: 		l,
					top: 		t,
					width: 		pw
				});
				
				if (p.height() > (ph = wh - t - settings.pad)) { 
					p.css({
						height: ph
					});
					ci.css({
						height: ph - dh
					});
				}
			},
			
			// Saving the position
			
			savePosition = function() {
				if (p.is(':visible')) {
					$.cookie('modalPosition' + settings.uid, 
						(p.position().left + ',' + p.position().top + ','
						+ p.width() + ',' + p.height()));
				}
			},
					
			// Showing the window
			
			showPanel = function(pos) {
				
				w.css({
					opacity: 0
				}).show();
				
				// leave enough time to create content
				
				setTimeout( function() {
					
					if (settings.savePosition) {
						var pos = $.cookie('modalPosition' + settings.uid);
						if (pos && (pos = pos.split(',')) && $.isArray(pos) && pos.length > 3) {
							placePanel(pos);
						} else {
							alignPanel();
						}
						setTimeout(function() {
							savePosition();	
						}, settings.speed);
					} else {
						alignPanel();
					}	
					
					if (!settings.blocking) {
						w.css({
							width: 		0,
							height: 	0,
							right: 		'auto',
							bottom: 	'auto',
							overflow: 	'visible'
						});
					}
					
					w.animate({
							opacity: 	1
						}, settings.speed)
						.attr({
							tabindex: 	0,
							'aria-hidden': false
						})
						.focus();
					
					if (settings.autoFade) {
						to = setTimeout(closePanel, settings.autoFade);
					}
	
					if (settings.scrollIntoView) {
						setTimeout(function() {
							var el = ci.children(':not(.buttons)').find('.active:first');
							if (el && el.length) {
								ci.scrollTop(Math.max(Math.floor(el.position().top) - 50, 0));
							}
						}, 200);
					}
					
				}, 40);
			};
		
		
		if (settings.uid) {
			$('#' + settings.uid).parents('.' + id.w).remove();
		}
		
		if (settings.defaultButton) {
			settings.defaultButton = translate(settings.defaultButton, 'OK');
		}
		
		// Creating new
		createNew();
		
		// Adding content
		addContent(content);
		
		// Adding buttons
		addButtons();
		
		// showing at center or retrieving the previous position / size
		showPanel();
				
		$window.on('resize.' + ns, updateDimensions);
		
		w.on('destroy.' + ns, closePanel);

		// Resizing the window
		
		if (settings.resizable) {
			
			// Resize handle
		
			var r = $('<a>', {
					'class': 	id.r
				}).appendTo(p),

				// Double-click functionality (maximize / previous state)
				toggleMaximize = function(e) {
					e.preventDefault();
					
					var cp = [ p.position().left, p.position().top, p.width(), p.height() ],
						mp = [ settings.pad, settings.pad, ww - 2 * settings.pad, wh - 2 * settings.pad ];
					
					var setPos = function(np) {		
						p.css({
							left: 		Math.minMax( settings.gap, np[0], ww - np[2] - settings.gap ),
							top: 		Math.minMax( settings.gap, np[1], wh - np[3] - settings.gap ),
							width: 		np[2],
							height: 	np[3]
						});
						ci.css({
							height: np[3] - dh
						});			
					};
					
					if (cp[0] === mp[0] && cp[1] === mp[1] && cp[2] === mp[2] && cp[3] === mp[3]) {
						setPos( p.data('wpos') );
					} else {
						setPos( mp );
						p.data( 'wpos', cp );
					}
					
					if (settings.savePosition) {
						savePosition();
					}
					
					return false;
				},
				
				resizeStart = function(e) {
					
					if (e.type === 'mousedown' && e.which !== 1 || p.is(':hidden')) {
						return true;
					}
				
					e.preventDefault();
					
					var w0 = p.width(), 
						h0 = p.height(),
						ec0 = getCoords(e.originalEvent),
						mw = w.width(),
						mh = wh - settings.pad - p.position().top - dh,
						mw = ww - settings.pad - p.position().left,
						
						resizeMove = function(e) {
							e.preventDefault();
							
							var ec = getCoords(e.originalEvent),
								nh = Math.min(Math.max(h0 + ec.y - ec0.y - dh, 20), mh);
							
							p.css({
								width: 		Math.min(Math.max(w0 + ec.x - ec0.x, 60), mw),
								height: 	nh + dh
							});
							ci.css({
								height: nh
							});
							
							return false;
						},
						
						resizeStop = function(e) {
							e.preventDefault();
							
							if (e.type === 'mouseup') {
								$document.off('mousemove.' + ns)
									.off('mouseup.' + ns);
							} else {
								r.off(TOUCH.MOVE + '.' + ns)
									.off(TOUCH.END + '.' + ns);
							}
							
							if (settings.savePosition) {
								savePosition();
							}
							
							return false;
						};
				
					x.trigger('removeTooltip');
					if (e.type === 'mousedown') {
						$document.on('mousemove.' + ns,	resizeMove)
							.on('mouseup.' + ns, resizeStop);
					} else {
						r.on(TOUCH.MOVE + '.' + ns, resizeMove)
							.on(TOUCH.END + '.' + ns, 	resizeStop);
					}
					
					return false;
				};
			
			h.on('dblclick.' + ns, toggleMaximize);
			
			r.on(TOUCH.START + '.' + ns + ' mousedown.' + ns, resizeStart);
		}
		
		return this;
	};
	
	$.fn.addModal.defaults = {
		speed: 				300,
		autoFade: 			0,
		width: 				400,
		resizable: 			false,
		movable: 			true,
		blocking: 			true,
		enableKeyboard: 	true,
		closeOnClickOut:	 true,
		darkenBackground: 	true,
		savePosition: 		false,
		scrollIntoView: 	false,
		defaultButton: 		'okButton',
		pad: 				6,
		pos: 				[ 1, 1 ],
		type: 				'normal'
	};
	
	$.fn.addModal.text = {
		closeWindow: 		'Close window',
		error: 				'error',
		warning: 			'warning'
	};

})(jQuery, $(document), $(window));