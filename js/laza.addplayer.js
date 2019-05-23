/*	
 *	addPlayer() :: adds jPlayer video player component
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).addPlayer( options, text )
 *	Options:
		id: 'jp_container_',			// ID for the container element
		backgroundColor: '#000000',		// Background color
		resPath: '',					// Path to 'res' folder
		swf: 'Jplayer.swf',				// Name of the SWF player
		relativeUrl: false,				// Allow using relative URLs
		solution: 'html,flash',			// Priority
		auto: false,					// Auto start
		loop: false,					// Loop playback
		keyboard: true,					// Use "space" key for play toggle
		size: {							// Player size
			width: '100%',
			height: '100%'
		}
 */

;(function($) {
	'use strict';
		
	$.fn.addPlayer = function( settings ) {
		
		if (typeof $.fn.jPlayer === 'undefined') {
			return;
		}
		
		settings = $.extend( {}, $.fn.addPlayer.defaults, settings );
		
		//text = $.extend( {}, $.fn.addPlayer.text, text );
		var text = getTranslations($.fn.addPlayer.text),
		
			macfox = navigator.userAgent.indexOf('Firefox') >= 0 && navigator.platform.indexOf('Mac') >= 0,
		
			// Class names
			sel = {
					cont: 			'jp-cont',
					mini: 			'jp-mini',
					audio: 			'jp-audio',
					video: 			'jp-video',
					playerType: 	'jp-type-single',
					player: 		'jp-jplayer',
					title: 			'jp-title',
					progress: 		'jp-progress',
					controls: 		'jp-controls-holder',
					startStop: 		'jp-startstop',
					volume: 		'jp-volume',
					times: 			'jp-times',
					toggles: 		'jp-toggles',
					warning: 		'jp-warning',
					// defined in jPlayer
					videoPlay: 		'jp-video-play',
					play: 			'jp-play',
					pause: 			'jp-pause',
					stop: 			'jp-stop',
					seekBar: 		'jp-seek-bar',
					playBar: 		'jp-play-bar',
					mute: 			'jp-mute',
					unmute: 		'jp-unmute',
					volumeBar: 		'jp-volume-bar',
					volumeBarValue: 'jp-volume-bar-value',
					volumeMax: 		'jp-volume-max',
					currentTime: 	'jp-current-time',
					duration: 		'jp-duration',
					fullScreen: 	'jp-full-screen',
					restoreScreen: 	'jp-restore-screen',
					repeat:			'jp-repeat',
					repeatOff: 		'jp-repeat-off',
					gui: 			'jp-gui',
					noSolution: 	'jp-no-solution',
					playing: 		'playing'
				},
		
			// Compiling interface
			
			getInterface = function( audio ) {
					var html,
						adda = function(name) {
							return '<a class="'+sel[name]+'" title="'+text[name]+'">'+text[name]+'</a>';
						};
					
					// Progress bar
					html = '<div class="'+sel.progress+'"><div class="'+sel.seekBar+'"><div class="'+sel.playBar+'"></div></div></div>';
					
					// Controls
					html += '<div class="'+sel.controls+'">';
					
						// Start/Stop (Prev/Next)
						html += '<div class="'+sel.startStop+'">' + adda('play') + adda('pause') + adda('stop') + '</div>';
						
						// Volume
						html += '<div class="'+sel.volume+'">' + adda('mute') + adda('unmute') + 
							'<div class="'+sel.volumeBar+'"><div class="'+sel.volumeBarValue+'"></div></div>' + '</div>';
							
						// Times: Current | Total
						html += '<div class="'+sel.times+'"><div class="'+sel.currentTime+'"></div><div class="'+sel.duration+'"></div></div>';
						
						// Toggle buttons
						html += '<div class="'+sel.toggles+'">' + (audio? '' : (adda('fullScreen') + adda('restoreScreen'))) +
							adda('repeat') + adda('repeatOff') + '</div>';
					
					html += '</div>';
					return html;
				},
				
			// Fix gui to match to container's padding
			
			fixPadding = function(c) {
					var pt = c.css('paddingTop'),
						pl = c.css('paddingLeft'),
						pr = c.css('paddingRight'),
						pb = c.css('paddingBottom');
						
					c.find('.' + sel.gui).css({
						bottom: 	pb,
						left: 		pl,
						right: 		pr
					});
					c.find('.' + sel.title).css({
						top: 		pt,
						left: 		pl,
						right: 		pr
					});
				},
				
			// Compiling GUI
			
			createPlayer = function(to, title, audio) {
					
					// Required to be able to use absolute positioned GUI elements
					if (to.css('position') !== 'absolute' && to.css('position') !== 'fixed') {
						to.css({
								position: 	'relative'
							});
					}
					
					to.css({
							overflow: 	'hidden'
						});
					
					var pl, 
						el = $('<div class="' + (audio? sel.audio : sel.video) + '"></div>').appendTo(to);
		
					// Player type wrap element
					el = $('<div class="' + sel.playerType + '"></div>').appendTo(el);
					
					// Adding player box
					pl = $('<div class="' + sel.player + '"></div>').appendTo(el);
					
					// Play button overlay
					el.append('<div class="' + sel.videoPlay + '"><a>' + text.play + '</a></div>');
					
					// Title
					if (title) {
						el.append('<div class="' + sel.title + '" data-noswipe><ul><li>' + title + '</li></ul></div>');
					}
					
					// Interface
					el.append('<div class="' + sel.gui + '" data-noswipe>' + getInterface(audio) + '</div>');
					
					// Adding "javascript:void" links to buttons
					//el.find('.' + sel.gui + ' a').attr('href', NOLINK);
					
					// Hiding the control bar in full screen by default
					if (to.hasClass(sel.fullScreen)) {
						el.find('.' + sel.gui).hide();
					}
					
					// No solution layer
					to.append('<div class="' + sel.noSolution + '">' + text.unsupportedMediaFormat + '</div>');
		
					// Fix padding
					fixPadding(to);
												
					return pl;
				},
				
			// Pause request
			
			pauseFn = function() {
					var p;
					if ((p = $(this).data('media'))) {
						p.jPlayer('pause');
					}
					return false;
				},
				
			// Destroy request
			
			destroyFn = function() {
					var p;
					if ((p = $(this).data('media'))) {
						p.jPlayer('destroy');
					}
					$(window).off('keydown', keyhandler);
					return false;
				},
				
			// Stop request
			
			stopFn = function() {
					var p;
					if ((p = $(this).data('media'))) {
						p.jPlayer('stop');
					}
					return false;
				},
				
			// Play request
				
			playFn = function() {
					var p;
					if ((p = $(this).data('media'))) {
						p.jPlayer('play');
					}
					return false;
				},
				
			// Keyboard handler hooked to the first media player element
				
			firstPlayer = $(this).eq(0),
			
			keyhandler = function(e) {
					if ((document.activeElement && (document.activeElement.nodeName === 'INPUT' || 
							document.activeElement.nodeName === 'TEXTAREA'))) {
						return true;
					}
				
					var k = e? e.keyCode : window.event.keyCode;
					
					if (k === 32) {
						firstPlayer.find('.' + sel.player).jPlayer(firstPlayer.data(sel.playing)? 'pause' : 'play');
						return false;
					}
					return true;
				},
				
			// Check Audio
				
			checkAudio = function( src ) {
					return settings.hasOwnProperty('audio')? settings.audio : ('.mp3.m4a.f4a.rtmpa'.indexOf(src.getExt()) > 0);
				},
				
			// Check if any playing is on
				
			checkAnyPlay = function() {
					$('.' + sel.cont).each(function() {
						if ($(this).data(sel.playing)) {
							return true;
						}
					});
					return false;
				},
						
			// Get the media format...
				
			getFormat = function(src) {
					
					// Finding or guessing the format
					var format,
						av =  checkAudio( src )? 'a' : 'v';
					
					switch (src.getExt()) {
						case 'mp3':
							format = 'mp3';
							break;
						case 'mp4': 
							format = 'm4' + av;
							break;
						case 'ogg': 
							format = 'og' + av;
							break;
						case 'webm':
							format = 'webm' + av;
							break;
						case 'flv':
						case 'f4a':
						case 'f4v':
							format = 'fl' + av;
							break;
						case 'rtmp':
							format = 'rtmp' + av;
							break;
						default:
							format = null;
					}
					
					return format;
				};
		
		// Main loop
		
		return this.each(function() {
			
			var cont = $(this),
				audio,
				format,
				//enableAuto,
				autoHide,
				folder = settings.folder || '',
				id, 
				src, 
				title, 
				poster, 
				elem = $(), 
				pl, 
				curr = 0,
				
				// Getting current media
				
				getMedia = function() {
				
						// Media URL
						var sm = {},
							csrc,
							format,
							base = settings.relativeUrl? '' : location.href.substring(0, location.href.lastIndexOf('/') + 1);
						
						if ($.isArray(src)) {
							if (curr >= src.length) {
								curr = 0;
							}
							// Playlist
							csrc = src[curr];
						} else {
							csrc = src;
							if (poster) {
								sm.poster = (base + folder + poster).fixUrl();
							}
						}
						
						format = getFormat(csrc);
						sm[format] = (base + folder + csrc).fixUrl();
						
						return sm;
						
					},
					
				// Saving play status
				
				saveStatus = function() {
						if ($.cookie) {
							var tm = cont.find('.' + sel.currentTime).text().split(':');
							if (tm.length > 2 ) {
								tm = (parseInt(tm[0], 10) * 60 + parseInt(tm[1], 10)) * 60 + parseInt(tm[2], 10);
							} else {
								tm = parseInt(tm[0], 10) * 60 + parseInt(tm[1], 10);
							}
							$.cookie('jp_' + cont[0].id, (cont.data(sel.playing)? '1':'0') + 
								'::' + tm + 
								'::' + pl.jPlayer('option', 'volume').toString().substring(0,5) +
								(curr? ('::' + curr) : '')
							);
						}
					},
					
				// Loading play status
				
				loadStatus = function(el) {
						if ($.cookie) {
							var c = $.cookie('jp_' + el[0].id);
							if (c) {
								c = c.split('::');
								return { 
									playing: 	c[0] === '1',
									time: 		parseInt(c[1] || 0, 10),
									volume: 	parseFloat(c[2] || 0.8),
									curr: 		parseInt(c[3] || 0, 10)
								};
							}
						}
						return null;
					};
						
			if (settings.elem) {
				
				// Reading source, title and poster from a link element
				elem = $(this).find(settings.elem);
				title = elem.attr('title');
				var img = elem.find('img:first');
				if (img.length) {
					src = img.data('link');
					poster = img.data('poster') || img.attr('src');
					if (!title) {
						title = img.attr('alt');
					}
				} else {
					src = elem.attr('href');
					poster = title = '';
				}
				
			} else {
				
				// Provided through call parameters
				src = settings.src;
				title = settings.title || '';
				poster = settings.poster || '';
				
				elem = $('<a href="' + src + '"' +
					(title? (' title="' + title + '"') : '') + 
					'>' + (poster? ('<img src="' + poster + '">') : '') + 
					'</a>').appendTo($(this));
			}
			
			// No source was found		
			if (!src) {
				return;
			}
			
			// Local Flash warning
			if (LOCAL) {
				var w = $('<div class="' + sel.warning + '">' + text.localFlashWarning + '</a></div>').appendTo(elem);
				elem.css('position', 'relative');
				w.hide();
				setTimeout(function() {
					w.fadeIn();
				}, 2000);
			}			
			
			// Playlist?
			if (src.indexOf('::') > 0) {
				src = src.split('::');
				// Checking the first element
				audio = checkAudio(src[0]);
				format = getFormat(src[0]);
			} else {
				audio = checkAudio(src);
				format = getFormat(src);
			}
			
			// Adding or reading container id
			if (!this.id) {
				this.id = settings.id + $.fn.addPlayer.id++;
			}	
			id = '#' + this.id;
			
			$(cont).addClass(sel.cont);
			if (settings.mini) {
				$(cont).addClass(sel.mini);
			}
			// Creating the structure
			pl = createPlayer(cont, (settings.showTitle? title : ''), audio);
									
			// Auto hide if not audio and not Firefox on Mac (fixing a bug)
			autoHide = !audio && !macfox;
			
			cont.on('setEndedFn', function(e, fn) {
				if (fn && $.isFunction(fn)) {
					settings.ended = fn;
				} else {
					settings.ended = null;
				}
			});
			
			// Calling jPlayer
			pl.jPlayer({
				cssSelectorAncestor: 	id,
				backgroundColor: 		settings.backgroundColor,
				supplied: 				format,
				swfPath: 				settings.resPath + '/' + settings.swf,
				solution: 				settings.solution,
				size: 					{
											width: 		'100%',
											height: 	'100%'
										},
				fullWindow: 			!audio && settings.fullScreen,
				preload: 				'auto',
				loop: 					settings.loop,
				volume: 				settings.volume,
				autohide: 				{
											restored: 	autoHide,
											full: 		autoHide
										},
				ready: function() {
					
					var t = $(this),
						st = settings.saveStatus? loadStatus(cont) : null;
					
					// Saving reference to player in the container element
					cont.data('media', t);
					
					// Save status on unload, set current
					if (settings.saveStatus) {
						$(window).on('unload', saveStatus);	
						if (st) {
							curr = st.curr;
						}
					}
					
					// Setting media source
					var sm = getMedia();
					
					// Hiding original poster element, showing GUI
					if (elem) {
						elem.hide();
					}
					
					// Hiding the control bar in full screen by default, showing otherwise
					// cont.find('.' + sel.gui).toggle(!(TOUCHENABLED || audio));
					
					t.jPlayer('setMedia', sm);
										
					// Adding events to container
					cont.on({
							play: 		playFn,
							pause: 		pauseFn,
							stop: 		stopFn,
							destroy: 	destroyFn
						});
					
					// Checking if play could started 1s later
					if (settings.saveStatus && st && st.playing || settings.auto) {
						var count = 50,
							checkReady = function() {
									var playBtn = cont.find('.' + sel.videoPlay),
										gui = cont.find('.' + sel.gui),
										v = t.find('audio,video')[0];
										
									if (!v || v.paused || v.readyState < 2) {
										// Unsuccessful auto start
										// show play button
										if (!playBtn.is(':visible')) {
											playBtn.fadeIn();
										}
										// hide GUI
										if (gui.is(':visible')) {
											gui.fadeOut();
										}
										if (--count) {
											// Further checking
											setTimeout(checkReady, 200);
										}
									} else {
										// Started playing
										playBtn.hide();
									}
								};
							
						setTimeout(checkReady, 1000);
					}
					
					if (settings.saveStatus && st) {
						// Start from saved position and volume
						t.jPlayer('volume', st.volume);
						t.jPlayer(st.playing? 'play' : 'pause', st.time);
					} else if (settings.auto) {
						// Auto play
						t.jPlayer('play');
					}
					
					// Key handler
					if (!settings.lowPriority) {
						$(window).on('keydown', keyhandler);
					}
				},
				
				// Playing indicator on container element
				play: function() { 
					// Avoid other jPlayers playing together
					$(this).jPlayer('pauseOthers');
					if (!settings.mini) {
						cont.find('.' + sel.videoPlay).fadeOut();
					}
					cont.data(sel.playing, true);
					if (TOUCHENABLED) {
						setTimeout(function() {
							cont.find('.' + sel.title).fadeOut(1000);
						}, 600);
					}
					if ($.isFunction(settings.play)) {
						settings.play.call();
					}
				},
				
				pause: function() {
					if (!settings.mini) {
						cont.find('.' + sel.videoPlay).fadeIn();
					}
					cont.data(sel.playing, false);
					if ($.isFunction(settings.pause)) {
						settings.pause.call();
					}
				},
				
				stop: function() {
					cont.data(sel.playing, false);
					if (TOUCHENABLED) {
						cont.find('.' + sel.title).fadeIn(300);
					}
					if ($.isFunction(settings.stop)) {
						settings.stop.call();
					}
				},
				
				ended: function() {
					if ($.isArray(src) && ((curr + 1) < src.length || settings.loop)) {
						curr = (curr + 1) % src.length;
						$(this).jPlayer('setMedia', getMedia());
						// Next track
						$(this).jPlayer('play');
					} else {
						cont.data(sel.playing, false);
					}
					if ($.isFunction(settings.ended)) {
						settings.ended.call();
					}
				}
			});
		});
	};
	
	$.fn.addPlayer.id = 0;

	$.fn.addPlayer.defaults = {
		id: 				'jp_container_',
		backgroundColor: 	'#000000',
		resPath: 			'',
		swf: 				'Jplayer.swf',
		relativeUrl: 		false,
		solution: 			'html,flash',
		volume: 			0.8,
		auto: 				false,
		loop: 				false,
		keyboard: 			true,
		lowPriority: 		false,
		saveStatus: 		false,
		mini: 				false,
		fullScreen: 		false,
		showTitle: 			false,
		size: 				{
								width: '100%',
								height: '100%'
							}
	};
	
	$.fn.addPlayer.text = {
		play: 				'play',
		pause: 				'pause',
		stop: 				'stop',
		mute: 				'mute',
		unmute: 			'unmute',
		fullScreen: 		'full screen',
		restoreScreen: 		'restore screen',
		repeat: 			'repeat',
		repeatOff: 			'repeat off',
		localFlashWarning: 	'Local Flash playback is possibly blocked by Flash security rules. Test videos in the uploaded album!', 
		unsupportedMediaFormat: '<span>Unsupported media format</span>You might need to either update your browser or the <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a> or use another browser to play this media.'
	};

})(jQuery);
