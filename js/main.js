/*
 *	Turtle skin libraries
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *	Bound to jAlbum licensing terms
 *	- http://jalbum.net/en/terms-and-conditions
 *
 */
 
/*
 * Removing the extra parameters from url in order Facebook can display 
 * the comments belonging to a page. Can be called before jQuery.
 */
 
var fixFbComments = function( pageName ) {
	var u = window.location.href;
	if (u.indexOf('?fb_') === -1) {
		u = u.split('#')[0];
		if (pageName && u[u.length-1] === '/') {
			u += pageName;
		}
	} else {
		u = u.split('?')[0];
	}
	document.getElementById('fb-comments').setAttribute('data-href', u);
};

/*
 * Hiding the browser bar on mobile devices
 * partly from http://menacingcloud.com/?c=iPhoneAddressBar
 */
 
var initMobile = function() {
	if ( !/Mobile/.test(navigator.userAgent) || 
		screen.width > 980 || screen.height > 980 || 
		(window.innerWidth !== document.documentElement.clientWidth && (window.innerWidth - 1) !== document.documentElement.clientWidth) ) {
		return;
	}
	var scrTop = function() {
		if (Object.prototype.hasOwnProperty.call(window, 'pageYOffset')) {
			window.scrollTo(0, window.pageYOffset + 1);
		}
		return true;
	};
	setTimeout(function() {
		scrTop();
	}, 1000);
	$(window).on('orientationchange', scrTop);
};

/* *****************************************************************************
 *
 *	The main skin closure :: the non-intrinsic functions that belong to the skin
 *
 ****************************************************************************** */
 
(function($, $document, $window, $body) {
	'use strict';
			
	// Reading keys: k="name1,name2,... from attr="data-k" into m
	
	$.fn.readData = function(m, k) {
		if (m == null || k == null) {
			return this;
		}
		k = k.split(',');
		var i, l = k.length, v;
		return this.each(function() {
			for (i = 0; i < l; i++) {
				if ((v = $(this).data(k[i])) != null) {
					m[k[i]] = v;
				}
			}
		});
	};
		
	// showin :: shows elements, like show() but display:inline-block;
	
	$.fn.showin = function() {
		return this.each(function() { 
			$(this).css('display', 'inline-block'); 
		});
	};
	
	// showin :: shows elements, like show() but display:inline-block;
	
	$.fn.togglein = function(to) {
		if (typeof to === UNDEF) {
			return this.each(function() {
				$(this).css('display', ($(this).css('display')==='none')? 'inline-block' : 'none'); 
			});
		}
		$(this).css('display', to? 'inline-block' : 'none');
		return this;
	};
	
	// getDim :: get dimensions of hidden layers
	
	$.fn.getDim = function() {
		var el = $(this).eq(0),
			dim = { 
					width: 		el.width(), 
					height: 	el.height() 
				};
		
		if ((dim.width === 0 || dim.height === 0) && el.css('display') === 'none') {
			var bp = el.css('position'),
				bl = el.css('left');
				
			el.css({
					position: 	'absolute', 
					left: 		'-10000px', 
					display: 	'block'
				});
			
			dim.width = el.width();
			dim.height = el.height();
			
			el.css({
					display: 	'none', 
					position: 	bp, 
					left: 		bl
				});
		}
		
		return dim;
	};	
					
	/*
	 *	Search :: searching throughout all the album pages
	 *
	 */
	
	if (typeof Search !== UNDEF) {
		
		Search.text = getTranslations({
			searchBoxTip:		'Search...',
			searchResultsFor:	'Search results for',
			newImages:			'New images',
			notFound:			'Not found',
			foundNImages:		'Found {0} item(s)',
			close:				'Close'
		});
		
		Search.start = function(source) {
	
			if (source == null) {
				return;
			}
						
			var t = (typeof source === 'string' || $.isNumeric(source))? String(source) :
					((source.nodeName === 'FORM')? $(source).find('input[type=search]').val().trim() : $(source).text().trim()),
				el, 
				found = 0, 
				c, 
				days, 
				ref, 
				sn = false, 
				dd, 
				cf,
				i, 
				j, 
				k, 
				l, 
				a, 
				p, 
				r, 
				s, 
				th, 
				hr, 
				tex, 
				ex, 
				re;
		
			if (!Search.data || 
				!$.isArray(Search.data) || 
				!Search.data.length || 
				!t || 
				t.length < 2) {
				return;
			}
			
			el = $('<div>', { 
					'class': 	'searchresults' 
				});
			
			var newSearch = function(inp) {
				if (inp && inp.length) {
					var v = inp.val().trim();
					if (v.length >= 2) {
						Search.start(v);
					}
				}
			};
			
			if (t.startsWith('@new')) {
				sn = true;
				ref = Search.created || Math.floor((new Date()).getTime() / 86400000);
				days = parseInt(t.split(':')[1], 10) || 30;
			} else {
				re = new RegExp('('+t.replace(/\s/g, '|')+')', 'i');
				el.append('<form><input type="text" value="' + t + '"><a class="button">&nbsp;</a></form>');
				el.find('.button').on('click', function(e) {
						newSearch($(this).siblings('input'));
						return false;
					});
				el.find('input').on('keydown', function(e) {
						if (e.which === 13) {
							e.preventDefault();
							newSearch($(e.currentTarget));
							return false;
						}
					});
			}
			
			r = (Search.rootPath && Search.rootPath !== '.')? (Search.rootPath + '/') : '';
			
			cf = window.location.href.getRelpath(Math.floor(r.length / 3));
			
			var clicked = function(e) {
				var a = $(e.target).closest('a');
				
				if ( !a.length || !a.hasClass('active') || !window.location.href.endsWith(a.attr('href')) ) { 
					if (!Search.makeSlides) {
						a.addClass('active');
						a.siblings('.active').removeClass('active');
					}
					$.cookie('lastSearch', t, 8);
					return true;
				}
				e.cancelBubble = true;
				return false;
			};
			
			for (i = 0; i < Search.data.length; i++) {
				
				p = r;
				if (Search.data[i][0].length) {
					p += (Search.urlEncode? Search.data[i][0] : encodeURIComponent(Search.data[i][0]).replace(/%2F/g,'/')) + '/';
				}
				l = (Search.data[i][1]).length;
	
				for (j = 0; j < l; j++) {
					
					s = Search.data[i][1][j].split(Search.sep);
					
					if ((sn && s.length > 5 && (dd = ref - parseInt(s[5], 10)) < days)  
						|| (!sn && re.test(Search.data[i][1][j]))) {
												
						// images or separate slide mode
						th = s[0].split(':');
						ex = th[0].getExt();
						tex = (th.length > 1)? th[1] : th[0].substring(th[0].lastIndexOf('.') + 1);
						hr = encodeURIComponent(th[0]);
						
						if (dd < 0) {
							dd = 0;
						}
						
						switch ( ex.toLowerCase() ) {
							case Search.ext:
								th = p + Search.folderThumb;
								break;
								
							case 'tif':
							case 'bmp':
								// Fixing extension in the link
								
								if (!Search.makeSlides)
									hr = hr.replaceExt(tex);
								
							case 'jpg':
							case 'jpeg':
							case 'png':
							case 'mp4':
								th = p + Search.thumbs + '/' + hr.replaceExt(tex);
								break;
								
							case 'mp3':
								if ( tex === 'png' ) {
									// No thm exists
									th = r + 'res/audio.png';
								} else {
									th = p + Search.thumbs + '/' + hr.replaceExt(tex);
								}
								break;
								
							case 'gif':
								hr = hr.replaceExt(tex);
								th = p + Search.thumbs + '/' + hr;
								break;
								
							case 'pdf':
							case 'zip':
							case 'txt':
							case 'doc':
							case 'xls':
								th = r + 'res/' + ex + '.png';
								break;
								
							default:
								th = r + 'res/unknown.png';
						}
						
						if (ex === Search.ext) {
							// Index or Custom page
							hr = p + hr;
							th = p + Search.folderThumb;
						} else {
							// Image
							hr = p + (Search.makeSlides? 
								(Search.slides + '/' + hr.replaceExt(Search.ext)) : 
								(Search.indexName + '#' + (Search.urlEncode? hr.replace(/\'/g, '%27').replace(/%/g, '%25').replace(/\(/g, '%2528').replace(/\)/g, '%2529') : hr))
							);
						}
						
						a = $('<a>', { 
								href: 	hr.fixUrl() 
							}).append($('<aside>').append($('<img>', { 
								src: 	th 
							}))).on('click', clicked).appendTo(el);
						
						// Marking current file
						if (hr.endsWith(cf)) {
							a.addClass('active');
						}
						
						if (s[1]) {
							// Title
							a.append($('<h5>').append(sn? s[1] : s[1].replace(re, '<em>$1</em>')));
						}
						
						if (s[2] && s[2] !== s[1]) {
							// Comment
							a.append($('<p>').append(sn? s[2].trunc(192) : s[2].trunc(192).replace(re, '<em>$1</em>') ));
						}
						
						for (k = 3; k < s.length - 1; k++) {
							// Keywords, Faces, ... the last one is the file mod date - don't show
							if ( s[k] && s[k].trim().length ) {
								a.append($('<p>').append(sn? s[k].trunc(192) : s[k].trunc(192).replace(re, '<em>$1</em>') ));
							}
						}
						
						if (sn) {
							a.append($('<p>').append('<em>' + getRelativeDate(dd) + '</em>') );
						}
						
						if (window.location.hash === s[0]) {
							c = found;
						}
						
						found++;
						//break;
					}
				}
			}
			
			if (source.jquery) {
				$(source).parents('.hint:first').fadeOut(100, function() {
					$(this).remove();
				});
			}
			
			if (!found) {
				el.append($('<p>', { 
						text: 	Search.text.notFound 
					}));
			} else {
				el.children('a:first').before($('<p>', {
						text: 	Search.text.foundNImages.template(found)
					}));
				setTimeout(function() {
						$('.searchresults > a').eq(c || 0).focus();
					}, 250);
			}
			
			$body.addModal(el, {
					uid: 				'searchres',
					title: 				(t.startsWith('@new')? Search.text.newImages : Search.text.searchBoxTip),
					darkenBackground: 	false,
					movable: 			true,
					blocking: 			false,
					closeOnClickOut: 	false,
					defaultButton: 		'close',
					resizable: 			true,
					width: 				240,
					pos: 				[ 2, 0 ],
					scrollIntoView: 	true,
					savePosition: 		true
				});
						
			return false;
		};
		
		Search.rootPath = '';
		
		Search.init = function(root) {
			Search.rootPath = root;
			var t = $.cookie('lastSearch'); 
			if (t && t.length && t !== 'null') {
				$.cookie('lastSearch', null); 
				Search.start(t);
			}
		};
		
	}
			
	/*
	 *	addRegions() :: adds area markers with Search functionality
	 *
	 *	Usage: $(element).addRegions( options );
	 *
	 * Options:
			id: 'regions',
			active: 'active',
			pos: { 
				posX: 1,
				posY: 2,
				toX: 1,
				toY: 0
			}
	 */
	
	$.fn.addRegions = function(el, regions, settings) {
		
		if (!el || !el.length || !regions) {
			return;
		}
		
		settings = $.extend( {}, $.fn.addRegions.defaults, settings );
		
		var regs = [];
		
		var parseRegions = function() {
			var i, v, x, y, w, h, r = regions.split('::');
			for ( i = 0; i < r.length; i++ ) {
				v = r[i].split(';');
				if (v.length > 4 && v[0].length && 
					(x = parseFloat(v[1])) !== null &&
					(y = parseFloat(v[2])) !== null &&
					(w = parseFloat(v[3])) !== null &&
					(h = parseFloat(v[4])) !== null) {
					//regs.push([ v[0], (x - w / 2) * 100 + '%', (y - h / 2) * 100 + '%', w * 100 + '%', h * 100 + '%' ]);
					regs.push([ v[0], x * 100 + '%', y * 100 + '%', w * 100 + '%', h * 100 + '%' ]);
				}
			}
		};
		
		parseRegions();
		
		if ( !regs.length ) {
			return this;
		}
				
		return this.each(function() {
			var t = $(this), 
				a, 
				ra, 
				pw = parseInt(t.css('padding-top'), 10),
				
				e = $('<div>', { 
						'class': 	settings.id 
					}).hide(),
					
				r = $('<div>', { 
						'class': 	settings.id + '-cont' 
					}).css({
						left: 		pw,
						top: 		pw,
						right: 		pw,
						bottom: 	pw
					}),
					
				clicked = function(e) {
						e.preventDefault();
						Search.start(e.target);
						return false;
					},
			
				mover = function(e) {
						r.children('a').eq($(e.target).index()).addClass(settings.active);
					},
			
				mout = function(e) {
						r.children('a').eq($(e.target).index()).removeClass(settings.active);
					};
			
			for (var i = 0; i < regs.length; i++) {
				a = $('<a>', {
						//href: 	NOLINK,
						text: 	regs[i][0]
					}).appendTo(e);
				
				ra = $('<a>').css({
						left: 		regs[i][1],
						top: 		regs[i][2],
						width: 		regs[i][3],
						height: 	regs[i][4]
					}).append($('<span>', { 
						text: 		regs[i][0] 
					})).appendTo(r);
				
				a.on({
						mouseover: 	mover, 
						mouseout: 	mout
					});
				
				if (typeof Search !== UNDEF) {
					ra.on('click', clicked);
				}
			}
			
			t.addTooltip(e, {
					touchToggle: 	true,
					stay: 			5000
				});
			
			t.on('destroy', function() {
					e.remove();
				});
			
			if (t.hasClass(settings.active)) {
				r.addClass(settings.active);
			}
				
			t.on('click', function() {
				$(this).add(r).toggleClass(settings.active);
			});
			
			el.append(r);
		});
	};
	
	$.fn.addRegions.defaults = {
		id: 		'regions',
		active: 	'active',
		pos: 		[1,2,1,0]
	};
	
	/*
	 *	centerThis() :: centers an image and fits optionally into its containing element 
	 *
	 *	Usage: $(element).centerThis( options );
	 *
	 * Options:
			selector: '.main',
			speed: 500,
			fit: true,
			enlarge: true,
			marginTop: 0,
			marginBottom: 0,
			marginLeft: 0,
			marginRight: 0,
			padding: 0,
			init: false,
			animate: false,
			effect: 'swing',
			complete: null
	 */
	
	$.fn.centerThis = function(settings) {
		
		settings = $.extend({}, $.fn.centerThis.defaults, settings);
				
		return this.each(function() {
						
			var c = $(this),
				el = c.find(settings.selector);
				
			if (!el.length) {
				return;
			}
			
			var	cw, 
				ch, 
				tw, 
				th, 
				tl, 
				tt, 
				ow, 
				oh, 
				bw, 
				pw,
				ml = settings.marginLeft + settings.padding,
				mr = settings.marginRight + settings.padding,
				mt = settings.marginTop + settings.padding,
				mb = settings.marginBottom + settings.padding;
			
			// original dimensions
			ow = el.data('ow');
			oh = el.data('oh');
			if (!ow || !oh) {
				el.data('ow', ow = el.width());
				el.data('oh', oh = el.height());
			}

			// border width :: assuming equal border widths
			if (!(bw = el.data('bw'))) {
				el.data('bw', bw = parseInt(el.css('border-top-width'), 10) || 0);
			}
			
			// padding :: assuming uniform padding
			if (!(pw = el.data('pw'))) {
				el.data('pw', pw = parseInt(el.css('padding-top'), 10) || 0);
			}
			
			// target boundaries
			cw = (c.innerWidth() || $body.width()) - 2 * (bw + pw) - ml - mr;
			ch = (c.innerHeight() || $body.height()) - 2 * (bw + pw) - mt - mb;
			
			// target dimensions
			if (settings.fit && (ow > cw || oh > ch || settings.enlarge)) {
				var r = Math.min(cw / ow, ch / oh);
				tw = Math.round(ow * r),
				th = Math.round(oh * r);
			} else {
				tw = ow;
				th = oh;
			}
			
			tl = Math.round((cw - tw) / 2) + ml;
			tt = Math.round((ch - th) / 2) + mt;				
			
			if (tw !== ow) {
				el.translateToPos();
			}
			
			if (!settings.animate) {
				
				// simply set the position and size
				el.css({
						left: 	tl,
						top: 	tt,
						width: 	tw,
						height: th
					});
				
				if ($.isFunction(settings.complete)) { 
					settings.complete.call(this);
				}
				
			} else {
				
				el.stop(true, false);
				// set prescale dimensions
				if (settings.preScale && settings.preScale !== 1.0) {
					var sw = tw * settings.preScale,
						sh = th * settings.preScale;
						
					el.css({
							left: 		Math.round((cw - sw) / 2) + ml,
							top: 		Math.round((ch - sh) / 2) + mt,
							width: 		Math.round(sw),
							height: 	Math.round(sh)
						});
				} else if (settings.init) {
					el.css({
							left: 		tl,
							top: 		tt
						});
				}
				
				// animating attributes
				el.animate({
						left: 		tl,
						top: 		tt,
						width: 		tw,
						height: 	th
					}, { 
						duration: 	settings.speed, 
						easing: 	settings.effect, 
						complete: 	settings.complete 
					});
			}
		});
	};
	
	$.fn.centerThis.defaults = {
		selector: 		'.main',
		speed: 			500,
		fit: 			true,
		enlarge: 		true,
		marginTop: 		0,
		marginBottom: 	0,
		marginLeft: 	0,
		marginRight: 	0,
		padding: 		0,
		init: 			false,
		animate: 		false,
		effect: 		'swing',
		complete: 		null
	};
	
	/*
	 *	Functions that can be called on pages with no gallery, 
	 *	e.g. index pages with folders only 
	 *
	 */
	 
	// collectMarkers :: finding data-map coordinates through a set a of elements
	
	$.fn.collectMarkers = function(settings) {
		
		settings = $.extend({}, $.fn.collectMarkers.defaults, settings);
		
		var markers = [], 
			c, 
			m, 
			t;
		
		this.each(function(n) {
			c = $(this).find(settings.selector);
			if (c.length && (m = c.data(settings.mapid)) && (m = $.getLatLng(m))) {
				t = c.data(settings.captionid) || c.attr('alt');
				markers.push({ 
					map: 		m, 
					label: 		(n + 1) + (t? (': ' + t.stripHTML()) : ''), 
					link: 		settings.dynamic? $(this) : $(this).attr('href') 
				});
			}
		});
		
		return markers;
	};
	
	$.fn.collectMarkers.defaults = {
		selector: 		'img:first',
		mapid: 			'map',
		captionid: 		'caption'
	};
	
	// markNewFolders :: marking the folders containing new pictures
	
	$.fn.markFoldersNew = function(settings) {
		
		settings = $.extend({}, $.fn.markFoldersNew.defaults, settings);
		
		var text = getTranslations($.fn.markFoldersNew.text);
		
		if (!settings.days) {
			return;
		}
		
		var ref = settings.ref || Math.round((new Date()).getTime() / 86400000);
		
		return this.each(function() {
			if ((ref - parseInt($(this).data('modified') || 0, 10)) <= settings.days) {
				$(this).after('<span class="' + settings.cls + '">' + text.newItem + '</span>');
			}
		});
	};
			
	$.fn.markFoldersNew.defaults = {
		days: 		7,				// day count :: 0 = no mark
		cls: 		'newlabel'
	};
	
	$.fn.markFoldersNew.text = {
		newItem: 	'NEW'
	};

	
	// turtleHelp :: sets up help for button and keyboard's F1 key
	
	$.fn.turtleHelp = function( settings ) {
		
		settings = $.extend( {}, $.fn.turtleHelp.defaults, settings );
		
		var text = getTranslations($.fn.turtleHelp.text),
				
			helpWindow = $('<div>', {
					'class': 'help'
				}),
				
			addPanel = function(name) {
					if (text.hasOwnProperty(name)) {
						var c = 1, k,
							el = $('<ul>', {
								'class': name
							}).appendTo(helpWindow);
						for (k in text[name]) {
							el.append($('<li><span>' + (c++) + '</span>' + text[name][k] + '</li>'));
						}
					}
				},
		
				showHelp = function() {
					$body.addModal(helpWindow, {
							uid: 			'help',
							title: 			text.help_title,
							width: 			720,
							savePosition: 	true,
							resizable: 		true
						});
				};
				
		if (settings.index) {
			addPanel('index');
		}
		
		if (settings.slide) {
			addPanel('slide');
		}
		
		if (settings.pressF1) {
			helpWindow.append($('<p>', {
				html: text.help_pressF1
			}));
		}
		
		if (settings.useF1) {
			$document.on('keydown', function(e) {
				if (document.activeElement && document.activeElement.nodeName === 'INPUT' || 
					($.isFunction(settings.enableKeyboard) && !settings.enableKeyboard()) || 
					$('#help').is(':visible')) {
					return true;
				}
				
				var k = e? e.keyCode : window.event.keyCode;
				
				if (k === 112) {
					e.preventDefault();
					showHelp();
					return false;
				}
				
				return true;
			});
		}
		
		return this.each(function() {
			$(this).on('click', function(e) {
				e.preventDefault();
				showHelp();
				return false;
			});			
		});	
	};
	
	$.fn.turtleHelp.defaults = {
		useF1: 		true,
		index: 		true,
		slide: 		false
	};
	
	$.fn.turtleHelp.text = {
		help_title: 			'Using Turtle gallery',
		help_pressF1: 			'Press <b>F1</b> any time to get help!',
		index: {
			help_topNavigation: 	'Top <b>navigation</b> bar with <b>Home</b> button',
			help_upOneLevel: 		'<b>Up</b> one level',
			help_authorInfo: 		'Author or company <b>information</b>',
			help_shareAndLike: 		'<b>Share</b> and <b>Like</b> buttons for social networking',
			help_searchNew: 		'Search <b>new images</b>',
			help_search: 			'<b>Search</b> button',
			help_downloadZip: 		'<b>Download</b> album or current folder as ZIP file',
			help_startSlideshow: 	'Start <b>slideshow</b> <em>Numpad *</em>'
		},
		slide: {
			help_previousPicture: 	'<b>Previous</b> picture <em>Left arrow</em><em>Swipe right</em>',
			help_backToIndex: 		'Back to <b>thumbnail page</b> / up one level <em>Esc</em>',
			help_toggleFit: 		'Toggle <b>fit to screen</b> or <b>1:1</b> size <em>Numpad +</em>',
			help_toggleInfo: 		'Show/hide <b>captions</b> and other panels, like Metadata, Map, Shopping, etc. <em>Numpad -</em>',
			help_toggleThumbnails: 	'Show/hide <b>thumbnail</b> scroller <em>Numpad -</em>',
			help_toggleAutoPlay: 	'Start/stop <b>slideshow</b> <em>Numpad *</em>',
			help_nextPicture: 		'<b>Next</b> picture <em>Right arrow</em><em>Swipe left</em>',
			help_toggleMeta: 		'Toggle <b>photo data</b>',
			help_toggleMap: 		'Toggle <b>map</b>',
			help_toggleShop: 		'Toggle <b>shopping options</b> panel',
			help_downloadImage: 	'Download <b>high resolution</b> file',
			help_shareAndLike: 		'<b>Share</b> and <b>Like</b> buttons for social networking',
			help_toggleComments: 	'Toggle <b>Facebook comments</b>',
			help_toggleFaces: 		'Toggle visibility of <b>tagged people</b>'
		}
	};	
	
	/* *******************************************************
	*
	*				Turtle gallery main
	*
	******************************************************** */
	
	$.fn.turtle = function(settings) {
		
		// adding the passed settings to the defaults
		
		settings = $.extend( {}, $.fn.turtle.defaults, settings );
		
		var id = $.fn.turtle.ids,
			text = getTranslations($.fn.turtle.text),
			
			saveSetting = function(n, s, e) {
					$.cookie(n, s, e);
					settings[n] = s;
					//log('Save ' + n + ': ' + s);
				};
				
		// Loading all the settings to retain from cookies / localstorage
		(function loadSettings( sn ) {
				for (var c, i = 0; i < sn.length; i++) { 
					if ((c = $.cookie(sn[i])) !== null) {
						settings[sn[i]] = c;
						//log('Load ' + sn[i] + ': ' + c);
					}
				}
			})(['thumbsOn', 'infoOn', 'commentsOn', 'metaOn', 'mapOn', 'regionsOn', 'shopOn', 'shareOn', 
				'printOn', 'fitImage', 'slideshowDelay', 'slideshowOn']);

		// Setting addScroll defaults
		$.fn.addScroll.defaults.dontDrag = '#' + id.map;
		
		// Setting up default view for the map
		$.fn.addMap.defaults.zoom = settings.mapZoom;
		$.fn.addMap.defaults.type = settings.mapType;
		$.fn.addMap.defaults.resPath = settings.resPath;
		
		// Setting up addShop defaults
		$.fn.addShop.defaults.id = settings.shopId;
		$.fn.addShop.defaults.path = (settings.albumName? (settings.albumName + '/') : '') + settings.relPath;
		$.fn.addShop.defaults.currency = settings.shopCurrency || 'EUR';
		$.fn.addShop.defaults.handling = settings.shopHandling || null;
		$.fn.addShop.defaults.locale = settings.shopLocale || 'US';
		$.fn.addShop.defaults.quantityCap = settings.shopQuantityCap || 0;
		$.fn.addShop.defaults.discount = settings.shopDiscount || 0;
		$.fn.addShop.defaults.options = settings.shopOptions || '';
		$.fn.addShop.defaults.coupons = settings.shopCoupons || '';
		$.fn.addShop.defaults.itemNameUses = settings.shopItemNameUses || 'fileName';
		if ( settings.shopContinueUrl ) {
			$.fn.addShop.defaults.continueUrl = settings.shopContinueUrl.match(/^https?:/i)?
				settings.shopContinueUrl : 
				(window.location.origin + settings.shopContinueUrl);
		}
		
		// Setting up addPlayer defaults
		$.fn.addPlayer.defaults.backgroundColor = $body.css('background-color').rgb2hex();
		if ( !settings.linkSlides ) {
			$.fn.addPlayer.defaults.fullScreen = settings.videoMaximize;
			$.fn.addPlayer.defaults.auto = settings.videoAuto;
			$.fn.addPlayer.defaults.solution = settings.prioritizeFlash? 'flash,html' : 'html,flash';
		}
		
		// Setting up image fitting and centering options
		$.fn.centerThis.defaults.fit = settings.fitImage;
		$.fn.centerThis.defaults.animate = settings.transitions;
		$.fn.centerThis.defaults.padding = settings.fitPadding;
		$.fn.centerThis.defaults.enlarge = !settings.fitShrinkonly;
		$.fn.centerThis.defaults.selector = '.' + id.main;
		
		// Setting up share options
		(function initShares(sh) {
				for (var i in sh) {
					if (sh.hasOwnProperty(i)) {
						$.fn.addSocial.defaults[i] = sh[i];
					}
				}
			})(settings.shares);
				
		settings.shareSlides = settings.shares && 
			((settings.linkSlides && 
				(settings.shares.facebookLike || settings.shares.facebook || settings.shares.gplus)) || 
				/*settings.shares.twitterTweet || settings.shares.googlePlus || settings.shares.tumblrBtn || settings.shares.pinItBtn || */ 
				settings.shares.twitter || settings.shares.pinterest || settings.shares.digg || settings.shares.delicious || 
				settings.shares.myspace || settings.shares.stumbleupon || settings.shares.reddit ||	settings.shares.email 
			);

		// Variables
		
		var today = Math.round((new Date()).getTime() / 86400000),
			useCssFilter = VEND === 'ms' && Modernizr && Modernizr.opacity === false,				
			images,									// All the images as passed to turtle
			items,									// The thumbnails container on index page
			gallery,								// Structural elements 
			wait,									// Wait animation layer
			navigation,								// Top navigation container
			controls,								// Control buttons
			bottom,									// Bottom (info) panel
			ctrl = {},								// Controls
			scrollbox,								// Thumbnail scroller box
			thumbs,									// The thumbnails 
			cimg = null,							// Current image layer
			pimg = null,							// Previous image layer
			curr = 0,								// current image
			to = null,								// timeout for slideshow
			sus = null,								// suspended timeout for videos
			index = $body.attr('id') === 'index',	// on index page
			page = $body.attr('id') === 'page', 	// on custom page
			dynamic = index && !settings.linkSlides, // dynamic mode or separate slides
			markers = [],							// all GPS markers
			
			smo = false,							// Scroll and Control layer over state and timeout
			cmo = false, 
			cto = null,
			rto = null,								// last window sizes to track with the resize event
			rlw = $window.width(), 
			rlh = $window.height();
			
		// Window resize action(s)
		
		var windowResized = function() {
			
			clearTimeout(rto);
			rto = setTimeout(function() {
				if (!$('.jp-video-full').length) {
					var rw = $window.width(), 
						rh = $window.height();
						
					if (rw !== rlw || rh !== rlh) {
						recenter();
						rlw = rw;
						rlh = rh;
					}
				}
			}, 100);
		};

		// last mouse positions
		var mly = -1, 
			mlx = -1;
			
		// Adding "Start slideshow" button
			
		var addShowStart = function(hd) {
			
			if (!hd) {
				return;
			}
			
			var stb = $('<div>', {
					'class': id.startShow
				}).appendTo(hd),
			
				tx = $('<div>', {
					'class': id.startTxt,
					width: 'auto',
					text: text.startSlideshow 
				}).appendTo('body'),
				
				ow = stb.width(),
				
				mw = tx.outerWidth();
				
			stb.append(tx);
			
			// Showing text only on mouse over the button (only if not visible by default)
			
			if (ow < mw) {
				tx.on({
					mouseenter: function() {
						stb.stop(true, false).animate({
							width: mw
						}, 500);
					},
					mouseleave: function() {
						stb.stop(true, false).animate({
							width: ow
						}, 500);
					}
				});
			}
			
			// Starting slideshow
			
			stb.on({
				click: function(e) {
					if ( dynamic ) {
						e.preventDefault();
						if ( settings.slideshowFullScreen ) {
							$('html').fullScreen(true);
						}
						if (curr === images.length - 1) {
							showImg(0);
						} else {
							showImg();
						}
						if (images.length) {
							setTimeout(startAuto, 1000); 
						}
						return false;
					} else {
						saveSetting('slideshowOn', true, 8);
						window.location.href = images.filter('.' + id.active).attr('href');
					}
				}
			});
			
		};
					
		// Setting up the header on the original page
		
		var setupHeader = function( hd ) {
			
			if (hd && hd.length) {
				if (index && (images.length > 1) && settings.showStart) {
					addShowStart(hd);
				}
				// Storing the up link
				settings.uplink = hd.find('.' + id.parent + '>a').attr('href') || '';
			}
		};
		
		// Nag screen
		
		var showNag = function() {
			
			if (!settings.licensee && 
				(typeof _jaShowAds === UNDEF || _jaShowAds) && 
				!LOCAL && !$.cookie('ls')) {
			
				var logo = settings.resPath + '/logo.png',
					img = $(new Image());
					
				img.load(function() {
					var p = $('<div>').css({ 
								background: 	'url(' + logo + ') 10px top no-repeat', 
								textAlign: 		'left', 
								minHeight: 		'60px', 
								paddingLeft: 	'90px' 
							}).html('<h4>Turtle skin <small>' + VER + '</small></h4><p>Unlicensed</p>');
					
					$body.addModal(p, {
							width: 			240,
							defaultButton: 	false,
							autoFade: 		600
						});
					
					$.cookie('ls', true);
					
				}).attr('src', logo);
			}
		};
		
		// Cookie policy
		
		var showCookiePolicy = function() {
		
			if (!$.cookie('cookiePolicy')) {
				var	el = $('<div>', { 
							id: 	'cookiepolicy' 
						}).appendTo('body'),
					p = $('<p>', { 
							html: 	text.cookiePolicyText 
						}).appendTo(el);
				
				if (settings.cookiePolicyUrl) {
					p.append($('<a>', { 
						text: 		text.cookiePolicyLearnMore, 
						href: 		settings.cookiePolicyUrl 
					}));
				}
				
				p.append($('<a>', {
						'class': 	'btn',
						text: 		text.cookiePolicyAgree 
					}).on('click', function(){ 
						$('#cookiepolicy').fadeOut(500, function() { 
							$(this).remove(); 
						});
						$.cookie('cookiePolicy', true, 36000000); // expires: 10000 days
					}));
				
				el.fadeIn(500);
				
				setTimeout(function() {
					$('#cookiepolicy').fadeOut(500, function() { 
						$(this).remove(); 
					});
				}, settings.cookiePolicyStay * 1000);
			}			
		};
									
		// Keyboard handler
		
		var keyhandler = function(e) {
			if ((gallery && gallery.is(':visible')) ||
					(document.activeElement && (document.activeElement.nodeName === 'INPUT' || 
					document.activeElement.nodeName === 'TEXTAREA')) || 
					($.isFunction(settings.enableKeyboard) && !settings.enableKeyboard())) {
				return true;
			}
			
			var k = e? e.keyCode : window.event.keyCode;

			switch(k) {
				case 13: 
				case 10:
					// Enter
					if (dynamic) {
						showImg();
					} else {
						window.location.href = images.eq(curr).attr('href');
					}
					break;
				/*
				case 27:
					// Esc
					goUp(); 
					break;
				*/
				case 37:
					curr = (curr? curr : images.length) - 1; 
					setActive(); 
					break;
					
				case 38:
					if (curr && settings.cols) {
						curr = Math.max(0, curr - settings.cols);
					}
					setActive(); 
					break;
					
				case 39:
					curr = (curr + 1) % images.length; 
					setActive();
					break;
					
				case 40: 
					if (curr < images.length - 1 && settings.cols) {
						curr = Math.min(images.length - 1, curr + settings.cols);
					}
					setActive(); 
					break;
					
				case 97: 
				case 35:
					// End
					curr = images.length - 1; 
					setActive(); 
					break;
					
				case 103: 
				case 36:
					// Home
					curr = 0; 
					setActive(); 
					break;
					
				case 106: 
				case 179:
					// Start slideshow
					if (dynamic && settings.slideshowFullScreen) {
						cmo = false;
						$('html').fullScreen(true);
					}
					if (dynamic) {
						showImg();
					}
					startAuto(); 
					break;
					
				default:
					return true;
			}
			
			return false;
		};
			
		var galleryKeyhandler = function(e) {
			if (gallery.is(':hidden') || 
				(document.activeElement && (document.activeElement.nodeName === 'INPUT' || 
				document.activeElement.nodeName === 'TEXTAREA')) || 
				($.isFunction(settings.enableKeyboard) && !settings.enableKeyboard())) {
				return true;
			}
			
			var k = e? e.keyCode : window.event.keyCode;

			switch(k) {
				case 27:
					// Esc
					backToIndex(); 
					break;
					
				case 37: 
					leftArrow(); 
					break;
					
				case 38: 
					upArrow(); 
					break;
				case 39: 
					rightArrow(); 
					break;
					
				case 40: 
					downArrow(); 
					break;
					
				case 97: 
				case 35:
					// End
					if (dynamic) {
						showImg(images.length - 1);
					} else {
						window.location.href = settings.firstPage;
					}
					break;
					
				case 103: 
				case 36:
					// Home
					if (dynamic) {
						showImg(0);
					} else {
						window.location.href = settings.firstPage;
					}
					break;
					
				case 106: 
				case 179:
					// * Start/Stop slideshow
					if (to) { 
						stopAuto(); 
					} else { 
						if (dynamic && settings.slideshowFullScreen)  {
							cmo = false;
							$('html').fullScreen(true);
						}
						startAuto(); 
					} 
					break;
					
				case 107:
					// + = Fit toggle
					zoomToggle(); 
					break;
					
				case 109:
					// - = Toggle panels
					togglePanels(); 
					break;
					
				default:
					return true;
			}
			
			return false;
		};

		// Going up one level
		
		var goUp = function() {
			var t = (settings.level > 0)? window : parent;
			// Test!!!
			t.location.href = settings.uplink || settings.indexPage || '../';
		};
		
		// Hiding gallery
		
		var backToIndex = function() {
			
			if (!dynamic) {
				if (settings.curr) {
					$.cookie('curr:' + settings.albumName + '/' + settings.relPath, settings.curr, settings.keepPrefs);
				}
				window.location.href = settings.indexPage;
			}
			
			if (settings.skipIndex && !settings.level && !settings.uplink) {
				return;
			}
			
			var i = $('[data-role=index]'), 
				p;
			
			$body.hideAllTooltips();
			
			if (gallery.is(':visible')) {
				// Gallery is on
				stopAuto();
				if (dynamic && settings.slideshowFullScreen) {
					$('html').fullScreen(false);
				}
				if (settings.skipIndex) {
					goUp();
				} else {
					if (i.length && i.is(':hidden')) {
						i.children().addBack().css( { 
								visibility: 	'visible', 
								display: 		'block' 
							});
						
						items.children('.' + id.cont).trigger('adjust');
						
						setTimeout(function() {
							items.loadImages();
						}, 100);
					}
					
					if (settings.transitions) {
						gallery.fadeOut(settings.speed);
					} else {
						gallery.hide();
					}
					
					// Pausing media playback
					if (cimg && (p = cimg.find('.' + id.video + ',.' + id.audio)).length) {
						p.trigger('pause');
					}
					
					// Refreshing map if any
					$('#' + id.map + '>.' + id.cont).trigger('adjust');
					
					if (settings.hash !== 'no') {
						$.history.load('');
					}
				}
				
			} else if (i.length && i.is(':hidden')) {
				// Index page is hidden
				i.children().addBack().css({ 
						visibility: 	'visible', 
						display: 		'block' 
					});
				
				setTimeout(function() {
					items.loadImages();
				}, 100);
			}
			
			i.find('[data-custom-scroll]').data('scrolling', false);
				
		};
					
		// Getting an image number based on its name or a jQuery element
		
		var getImg = function(n) {
			var i;
			if (n == null) {
				i = curr;
			} else if (typeof n === 'number') {
				i = Math.minMax(0, n, images.length);
			} else if ((i = images.index(n)) < 0 && thumbs) {
				i = thumbs.index(n);
			}
			return i;
		};
		
		// Find image by name
		
		var findImg = function(n) {
			var i, e, s;
			for (i = 0; i < images.length; i++) {
				e = images.eq( i ).children('img:first');
				s = e.length && (e.data(id.link) || e.data(id.src)).getFile();
				if (s && s === n) {
					return i;
				}
			}
			return -1;
		};
		
		// Get the current filename
		
		var getCurrFile = function() {
			var e = images.eq(curr).children('img:first');
			return e.length? (e.data(id.link) || e.data(id.src)).getFile() : null;
		};
		
		// Handling Checkboxes
		
		var selectAll = function(on) {
			images.children('.' + id.checkbox).toggleClass(id.active, on);
			if (gallery) {
				gallery.find('.' + id.checkbox).toggleClass(id.active, on);
			}
		}
		
		var setupCheckboxes = function() {
			
			var clickBox = function(e) {
						e.preventDefault();
						var sel = $(this).hasClass(id.active);
						
						$(this).toggleClass(id.active, !sel);
						
						if ($(this).parent().hasClass(id.active)) {
							gallery.find('.' + id.checkbox).toggleClass(id.active, !sel);
						}
						return false; 
					},
			
				dblClickBox = function(e) {
						e.preventDefault();
						selectAll(!$(this).hasClass(id.active));
						return false; 
					};
			
			// thumbnails
			images.children('.' + id.checkbox).on({
					'click': 		clickBox,
					'dblclick':		dblClickBox
				});
		};
			
		// Setting active image on both the thumb scroller and the source 
		
		var setActive = function(nofocus) {
			var a = images.eq(curr);
			
			images.filter('.' + id.active).removeClass(id.active);
			
			a.addClass(id.active);
			
			if (!settings.skipIndex && (typeof nofocus === UNDEF || nofocus === false)) {
				a.trigger('setactive');
			}
			
			if (thumbs) {
				thumbs.filter('.' + id.active).removeClass(id.active);
				thumbs.eq(curr).addClass(id.active).trigger('setactive');
			}
			
			if (settings.mapOnIndex) {
				$('#' + id.map + ' .' + id.cont).trigger('setactive', a.find('img:first').data(id.mapid));
			}
			
			if (curr) {
				$.cookie('curr:' + settings.albumName + '/' + settings.relPath, curr, settings.keepPrefs);
			}
		};
		
		var clearActiveCookie = function() {
			$.cookie('curr:' + settings.albumName + '/' + settings.relPath, null);
		};
						
		// Right arrow pressed
		
		var rightArrow = function() {
			var el = $('.' + id.main), w = $('.' + id.img);
			
			if (!el.length) {
				return;
			}
			
			if (el.position().left + el.outerWidth() <= w.width() - settings.fitPadding) {
				nextImg();
			} else {
				var d = Math.round(w.width() * 0.8);
				
				el.animate({
						left: 	Math.max((el.position().left - d), w.width() - settings.fitPadding - el.outerWidth())
					}, settings.scrollDuration);
			}
		};
		
		// Left arrow pressed
		
		var leftArrow = function() {
			var el = $('.' + id.main), w = $('.' + id.img);
			
			if (!el.length) {
				return;
			}
			
			if (el.position().left >= settings.fitPadding) {
				previousImg();
			} else {
				var d = Math.round(w.width() * 0.8);
				
				el.animate({
						left: 	Math.min((el.position().left + d), settings.fitPadding)
					}, settings.scrollDuration); 
			}
		};
					
		// Up arrow pressed
		
		var upArrow = function() {
			var el = $('.' + id.main), w = $('.' + id.img);
			
			if (!el.length || el.position().top > settings.fitPadding) {
				return;
			}
			
			var d = Math.round(w.width() * 0.8);
			
			el.animate({
					top: 	Math.min((el.position().top + d), settings.fitPadding)
				}, settings.scrollDuration); 
		};
		
		// Down arrow pressed
		
		var downArrow = function() {
			var el = $('.' + id.main), w = $('.' + id.img);
			
			if (!el.length || el.position().top + el.outerHeight() <= w.height() - settings.fitPadding) {
				return;
			}
			
			var d = Math.round(w.width() * 0.8);
			
			el.animate({
					top: 	Math.max((el.position().top - d), w.height() - settings.fitPadding - el.outerHeight())
				}, settings.scrollDuration);
		};
		
		// Calcel dragging
		
		var dragCancel = function() {
			cimg.find('.' + id.main).trigger('dragcancel');
		};
		
		// Previous image
		
		var previousImg = function() {
			//log('previousImg');
			stopAuto();
			
			if (dynamic) {
				if (curr) {
					showImg(curr - 1);
				} else if (settings.afterLast === 'startover') {
					showImg(images.length - 1);
				} else if (settings.afterLast === 'nextfolder') {	
					if (settings.previousFoldersLast) {
						window.location.href = settings.previousFoldersLast;
					} else {
						dragCancel();
					}
				} else {
					dragCancel();
				}
			} else {
				var l = $('.' + id.controls + ' .' + id.prev);
				if (l.length && (l = l.attr('href')) !== NOLINK) {
					window.location.href = l;
				} else {
					dragCancel();
				}
			}
		};
		
		// Next image
		
		var nextImg = function(noStop) {
			
			//log('nextImg');
			
			var buttons = [];
			
			if (dynamic) {
					
				if (curr < images.length - 1) {
					
					if (noStop) {
						keepAuto();
					} else {
						stopAuto();
					}
					showImg(curr + 1);
					return;
					
				} else {
					
					if (settings.afterLast === 'startover' || to && settings.slideshowLoop) {
						
						if (noStop) {
							keepAuto();
						} else {
							stopAuto();
						}
						showImg(0);
						return;
						
					} else {
						
						clearActiveCookie();
						dragCancel();
						
						switch (settings.afterLast) {
							
						case 'onelevelup':
							if (settings.uplink) {
								goUp();
							}
							break;
							
						case 'backtoindex':
							if (!settings.skipIndex) {
								backToIndex();
							}
							break;
							
						case 'nextfolder':
							if (settings.nextFoldersFirst) {
								if (to !== null) {
									$.cookie('slideshowDelay', settings.slideshowDelay, 8);
								}
								window.location.href = settings.nextFoldersFirst;
							} else {
								stopAuto();
							}
							break;
							
						case 'ask':
							
							stopAuto();
							
							if (images.length > 1) {
								// Start over
								buttons.push({
										t: 	text.startOver,
										h: 	function() { 
												showImg(0); 
											}
									});
							}
							
							if (settings.uplink) {
								// Up one level
								buttons.push({
										t: 	(settings.level > 0)? text.upOneLevel : (settings.homepageLinkText || text.backToHome), 
										h: 	function() { 
												goUp(); 
											}
									});
							}
							
							if (!settings.skipIndex) {
								// Back to thumbnails
								buttons.push( {
										t: 	text.backToIndex, 
										h: 	function() { 
												backToIndex(); 
											}
									});
							}
							
							if (settings.nextFoldersFirst) {
								// Go to next folder
								buttons.push({
										t: 	text.nextFolder, 
										h: 	function() { 
												window.location.href = settings.nextFoldersFirst;
											}
									});
							}
					
							$body.addModal($('<p>', { 
									text: 		text.atLastPageQuestion
								}), buttons, {
									type: 		'question',
									uid: 		'dialog',
									title: 		text.atLastPage,
									width: 		500
								});
							
						}
						
						dragCancel();
					}
				}
				
			} else {
				
				var l = $('.' + id.controls + ' .' + id.next);
				
				if (l.length && (l = l.attr('href')) && l.length && l !== NOLINK) {
					
					// Has next image
					saveSetting('slideshowDelay', settings.slideshowDelay);
					if (to) {
						saveSetting('slideshowOn', noStop, 8);
					}
					window.location.href = l;
				
				} else if (settings.afterLast === 'ask') {
					
					// At last image
					stopAuto();
					dragCancel();
					clearActiveCookie();
					
					if (settings.firstPage) {
						// Start over 
						buttons.push({
								t: 	text.startOver,
								h: 	function() { 
										if (to) {
											saveSetting('slideshowOn', to != null, 8);
										}
										window.location.href = settings.firstPage;  
									}
							});
					}
					
					if (settings.uplink) {
						// Up one level
						buttons.push({
								t: 	(settings.level > 0)? text.upOneLevel : (settings.homepageLinkText || text.backToHome), 
								h: 	function() { 
										goUp();
									}
							});
					}
					
					if (settings.indexPage) {
						// Back to thumbnails
						buttons.push({
								t:	text.backToIndex, 
								h: 	function() { 
										window.location.href = settings.indexPage;
									}
							});
					}
					
					if (settings.nextFoldersFirst) {
						// Go to next folder
						buttons.push({
								t: 	text.nextFolder, 
								h: 	function() { 
										window.location.href = settings.nextFoldersFirst;
									}
							});
					}
					
					$body.addModal($('<p>', { 
							text: 		text.atLastPageQuestion
						}), buttons, {
							uid: 		'dialog',
							type: 		'question',
							title: 		text.atLastPage,
							width: 		500
						});
						
				}
				
			}
		};

		// Function to call at the end of a video
		
		var videoEndedFn = function() {
			if (sus) {
				sus = clearTimeout(to);
				to = setTimeout(function() {
					nextImg(true);
				}, 300);
			}
		};

		// Function to call at the end of a video
		
		var videoStartedFn = function() {
			if (to) {
				sus = to;
				to = clearTimeout(to);
			}
		};
		
		// Restarts counting down for the next image in slideshow mode
		
		var keepAuto = function() {
			if (to) {
				clearTimeout(to);
				to = setTimeout(function() {
					nextImg(true);
				}, settings.slideshowDelay);
			}
		};
		
		// Starts slideshow mode
		
		var startAuto = function() {
			to = clearTimeout(to);
			var p;
			
			ctrl.play.hide();
			ctrl.pause.showin();
			
			$.cookie('slideshowDelay', settings.slideshowDelay, 8);
			
			if ((p = cimg.find('.' + id.video + ',.' + id.audio)).length && (p.data('playing') || settings.videoAuto)) {
				sus = true;
				p.trigger('setEndedFn', videoEndedFn);
			} else {
				to = setTimeout(function() {
					nextImg(true);
				}, settings.slideshowDelay);
			}
			
			if (settings.bgAudioId) {
				$(settings.bgAudioId).trigger('play');
			}
			
			fadeCtrl();
		};
		
		// Stops slideshow mode
		
		var stopAuto = function() {
			sus = false;
			ctrl.pause.hide();
			ctrl.play.showin();
			
			$.cookie('slideshowDelay', null);
			
			if (to) {
				var p;
				to = clearTimeout(to);
				fadeCtrl();
				
				if (!dynamic) {
					saveSetting('slideshowOn', false);
				} else if (settings.bgAudioId) {
					$(settings.bgAudioId).trigger('pause');
				}
				
				if ((p = cimg.find('.' + id.video + ',.' + id.audio)).length && (p.data('playing') || settings.videoAuto)) {
					p.trigger('setEndedFn', null);
				}
			}
		};
		
		// Controls is on (no duplicate animation is needed)

		var con = false;
		
		// Showing controls
		
		var showCtrl = function() { 
			
			if (cmo || con) {
				return;
			}
			
			con = true;
			
			controls.stop(true, false).fadeTo(200, 0.8, function() {
				if (useCssFilter) {
					controls.css('filter', null);
				}
			});
			
			cto = setTimeout(function() { 
				fadeCtrl();
			}, 1500);
		};
		
		// Fading controls
		
		var fadeCtrl = function() {
			if (cmo) { 
				cto = setTimeout(function() { 
					fadeCtrl();
				}, 750);
			} else {
				con = false;
				cto = clearTimeout(cto);
				controls.fadeTo(500, settings.controlOutOpacity);
			}
		};
		
		// Toggle controls
		
		var toggleCtrl = function(e) {
			//if ( parseFloat(controls.css('opacity')) > settings.controlOutOpacity ) {
			if (e.target && (e.target.nodeName === 'A' || $(e.target).parents('.' + id.bottom).length)) {
				return true;
			}
			
			if (con) {
				con = false;
				cto = clearTimeout(cto);
				controls.fadeTo(500, settings.controlOutOpacity);
			} else {
				showCtrl();
			}
			return true;				
		};
		
		// Initializing bottom panel
		
		var initCaption = function() {
			
			if (settings.infoOn) {
				ctrl.showInfo.hide();
				ctrl.hideInfo.showin();
				bottom.show().css({
						bottom: 	0
					});
			} else {
				ctrl.hideInfo.hide();
				ctrl.showInfo.showin();
				bottom.css({
						bottom: 	-bottom.outerHeight()
					}).hide();
			}
		};
		
		// Hiding bottom panel (info)
		
		var hideCaption = function() {
			
			if (!settings.infoOn) {
				return;
			}
			
			ctrl.hideInfo.hide();
			ctrl.showInfo.showin();
			
			if (settings.transitions) {
				bottom.animate({
						bottom: 	-bottom.outerHeight()
					}, 500, function() { 
						bottom.hide(); 
					});
			} else {
				bottom.css({
					bottom: 	-bottom.outerHeight()
				}).hide();
			}

			if (cimg && settings.fitFreespace) { 
				cimg.centerThis( {
						fit: 			settings.fitImage,
						marginTop: 		scrollboxHeight(),
						marginBottom: 	0
					});
			}
			
			fadeCtrl();
			saveSetting('infoOn', false);
		};
		
		// Showing bottom panel
		
		var showCaption = function() {

			if (settings.infoOn) {
				return;
			}
			
			ctrl.showInfo.hide();
			ctrl.hideInfo.showin();
			
			if (bottom.is(':hidden')) {
				bottom.show().css({ 
						bottom: 	-bottom.outerHeight() 
					});
			}
			
			var ma = function() {
					bottom.children('.' + id.map).trigger('adjust');
				};
			
			if (settings.transitions) {
				bottom.animate({
						bottom: 	0
					}, 500, ma);
			} else {
				bottom.show().css({
					bottom: 0
				});
				ma();
			}
			
			if (cimg && settings.fitFreespace) { 
				cimg.centerThis( {
						fit: 			settings.fitImage,
						marginTop: 		scrollboxHeight(),
						marginBottom:	bottom.outerHeight()
					});
			}
			
			fadeCtrl();
			saveSetting('infoOn', true);
		};
		
		// Initializing scroll box on slide pages
		
		var initScrollbox = function() {
			
			if (settings.thumbsOn) {
				ctrl.showThumbs.hide();
				ctrl.hideThumbs.showin();
				navigation.css({
						top: 	0
					}).removeClass('hide');
			} else {
				ctrl.hideThumbs.hide();
				ctrl.showThumbs.showin();
				navigation.css({
						top: 	-scrollbox.outerHeight() - 10
					}).removeClass('hide');
			}
		};
		
		// Hiding scroll box
		
		var hideScrollbox = function() {
			
			if (!settings.thumbsOn) {
				return;
			}
			
			ctrl.hideThumbs.hide();
			ctrl.showThumbs.showin();
			
			if (settings.transitions) {
				navigation.animate({
						top:	-scrollbox.outerHeight() - 10
					}, 500);
			} else {
				navigation.css({
						top: 	-scrollbox.outerHeight() - 10
					});
			}
			
			if (cimg && settings.fitFreespace) { 
				cimg.centerThis({
						fit: 			settings.fitImage,
						marginTop: 		0,
						marginBottom: 	infoboxHeight()
					});
			}
			
			fadeCtrl();
			saveSetting('thumbsOn', false);
		};
		
		// Showing scroll box
		
		var showScrollbox = function() {
			
			if (settings.thumbsOn) {
				return;
			}
			
			ctrl.showThumbs.hide();
			ctrl.hideThumbs.showin();
			
			if (settings.transitions) {
				navigation.animate({
						top: 	0
					}, 500);
			} else {
				navigation.css({
						top: 	0
					});
			}
			
			if (cimg && settings.fitFreespace) { 
				cimg.centerThis({ 
						fit: 			settings.fitImage,
						marginTop: 		scrollbox.outerHeight(),
						marginBottom: 	infoboxHeight()
					});
			}
			
			fadeCtrl();
			saveSetting('thumbsOn', true);
		};
		
		// Toggling panels
		
		var togglePanels = function() {
			var fs = settings.fitFreespace;
			
			settings.fitFreespace = false;
			
			if (settings.infoOn || settings.thumbsOn) {
				hideScrollbox();
				hideCaption();
				
				if (cimg && fs) { 
					cimg.centerThis({ 
							fit: 			settings.fitImage,
							marginTop: 		0,
							marginBottom: 	0
						});
				}
			} else {
				showScrollbox();
				showCaption();
				
				if (cimg && fs) { 
					cimg.centerThis({ 
							fit: 			settings.fitImage,
							marginTop: 		scrollbox.outerHeight() || 0,
							marginBottom: 	bottom.outerHeight() || 0
						});
				}
			}
			
			settings.fitFreespace = fs;
		};
		
		// Scroll box height to calculate the free space for fitting the main image
		
		var scrollboxHeight = function() {
			return (settings.fitFreespace && navigation.position().top >= 0)? (scrollbox.outerHeight() || 0) : 0;
		};
		
		// Info box height
		
		var infoboxHeight = function() {
			return (settings.fitFreespace && bottom.is(':visible'))? (bottom.outerHeight() || 0) : 0;
		};
		
		// Realigning the main picture to fit and center the free space
		
		var recenter = function() {
			if (cimg) { 
				cimg.centerThis({ 
						fit: 			settings.fitImage,
						marginTop: 		scrollboxHeight(),
						marginBottom: 	infoboxHeight()
					});
			}
		};
		
		// Handling zoom
		
		var initZoom = function() {
			if (!settings.hideFitBtn) {
				if (settings.fitImage) {
					ctrl.resize.hide();
					ctrl.noresize.showin();
				} else {
					ctrl.noresize.hide();
					ctrl.resize.showin();
				}
			}
		};
		
		var zoomToggle = function() {
			if (settings.fitImage) {
				zoomReset();
			} else {
				zoomFit();
			}
		};
		
		var zoomReset = function() {
			if (!settings.hideFitBtn) {
				ctrl.noresize.hide();
				ctrl.resize.showin();
			}
			
			$.fn.centerThis.defaults.enlarge = !settings.fitShrinkonly;
			
			cimg.centerThis({
					fit: 			false, 
					marginTop: 		scrollboxHeight(),
					marginBottom: 	infoboxHeight()
				});
			
			fadeCtrl();
			saveSetting('fitImage', false);
		};
		
		var zoomFit = function() {
			if (!settings.hideFitBtn) {
				ctrl.resize.hide();
				ctrl.noresize.showin();
			}
			
			$.fn.centerThis.defaults.enlarge = true;
			
			cimg.centerThis({ 
						fit: 			true,
						marginTop: 		scrollboxHeight(),
						marginBottom: 	infoboxHeight()
					});

			fadeCtrl();
			saveSetting('fitImage', true);
		};
			
		// Removing the attached behaviors and handlers
		
		var cleanupImg = function( el ) {
			el.trigger('destroy');
			el.find('.' + id.video + ',.' + id.audio).trigger('destroy');
			el.find('.' + id.share + '-' + id.icon).trigger('destroy');
			el.find('.' + id.map).trigger('destroy');
		};
		
		// Click handler
		
		var thumbClick = function(e) {
			if ($(this).parents('[data-custom-scroll]').data('scrolling') || !dynamic) {
				return true;
			}
			e.preventDefault();
			$(this).trigger('removeTooltip');
			showImg($(this)); 
			return false;
		};

		// Ditching previous image
		
		var trashImg = function( img ) {
			if (img && img.length) {
				img.stop();
				cleanupImg(img);
				img.remove();
			}
		};

		// Initializing history plugin :: Jumping to the hash image
			
		var goHash = function( hash ) {			
			var n;
			if (hash && hash.length && 
				(n = (settings.hash === 'number')? ((parseInt( hash, 10 ) || 1) - 1) : findImg( hash )) >= 0 && n < images.length) {
				showImg(n, false);
				settings.slideshowAuto = false;
			} else {
				backToIndex();
				if (VEND == 'ms') { 
					setTimeout(function() {
						$('[data-role=index]').show();
						$('[data-custom-scroll]').trigger('adjust');
					}, 10 );
				}
			}
		};
		
		// Loading history state
		
		var loadHistory = function( n ) {
			if (settings.hash === 'number') {
				$.history.load(n + 1);
			} else {
				var h = getCurrFile();
				if ( h ) {
					$.history.load( h );
				}
			}
		};

		// Showing image N
		
		var showImg = function(n, updateHash) {
			
			//log('showImg('+n+')');
			
			if (typeof updateHash === UNDEF) {
				updateHash = true;
			}
			
			// If the argument is not number get the image no
			if (typeof n !== 'number') {
				n = n? getImg(n) : curr;
			}
			
			// Show gallery if we're on the index page
			if (gallery.is(':hidden')) {
				if (cimg && cimg.data('curr') !== n) {
					trashImg(cimg);
				}
				if (settings.transitions) {
					gallery.fadeIn(settings.speed);
				} else {
					gallery.show();
				}
				$body.hideAllTooltips();
				scrollbox.children(':first').loadImages();
			}
			
			// We're on the requested image already
			if (cimg && cimg.data('curr') === n) {
				//console.log('On current image');
				if (updateHash !== false) {
					loadHistory(n);
				}
				return;
			}
			
			// Variables
			var a = images.eq(n),
				src = a.attr('href'),
				im = a.children('img').eq(0), 
				el, w, h;
			
			if (!im.length) {
				return;
			}
			
			// Stop and remove the current image
			if (cimg) {
				trashImg(pimg);
				pimg = cimg;
				pimg.css({
						zIndex: 	0
					});
				
				setTimeout(function(el) {
					el.trigger('unswipe');
				}, 50, pimg.find('.' + id.main));
				
				pimg.unmousewheel();
			}
			
			// Remove all trash layers if exists
			if ((el = gallery.children('.' + id.img).not(cimg)).length) {
				el.stop().remove();
			}
			
			// Creating current image div 
			cimg = $('<div>', {
					id: 		'img' + n,
					'class': 	id.img 
				}).css({
					zIndex: 	1, 
					display: 	'none'
				}).data({
					curr: 		n
				}).appendTo(gallery);
			
			if (settings.clickBesideForIndex && 
				(!settings.skipIndex || settings.level || settings.uplink)) { 
				cimg.on('click', function(e) {
					if ($(e.target).hasClass('img')) {
						e.preventDefault();
						backToIndex();
						return false;
					}
				});
			}

			// Showing wait animation
			wait.css({
					opacity: 	0, 
					display: 	'block'
				}).animate({
					opacity: 	1
				});

			// Setting the current thumb 'active' 
			curr = n; 
			setActive();
			
			if (dynamic && updateHash) {
				loadHistory(curr);
			}
			
			// Wrapper element
			var wr = $('<div>', { 
					'class': 	id.main 
				});
			
			// Checking type			
			if (im.data(id.isother) || !src) {
				
				// Other file type or external / embedded content
				w = Math.max(im.data(id.width) || gallery.width() - 160, 280);
				h = Math.max(im.data(id.height) || gallery.height() - 120, 200);
				
				wr.addClass(id.other);
				
				var cont = im.data(id.content);
				
				if (cont && (cont = cont.trim()).length) {
					
					// Embedding the external content into an iframe
					wr.css({
							width: 		w,
							height: 	h
						}).append(
							cont.match(/^https?:\/\//i)?
								$('<iframe>', { 
									width: 			'100%',
									height: 		'100%',
									src: 			cont,
									frameborder: 	0,
									allowfullscreen: 'allowfullscreen'
								}) 
								: 
								cont 
						);
				} else {
					var a = $('<a>', { 
								href: 		im.data(id.link), 
								target: 	'_blank' 
							}),
						i = $('<img>', {
								src: 		im.data(id.src) || im.attr('src')
							}).appendTo(a);
					
					// Adding the thumbnail with a link to the original file
					wr.append(a).append($('<p>', { 
							text: 	text.clickToOpen 
						}));
				}
				
				imgReady(wr);
				
			} else if (im.data(id.isvideo) || im.data(id.isaudio)) {
				
				// Video or audio file
				w = im.data(id.width) || gallery.width() - 160;
				h = im.data(id.height) || gallery.height() - 120;
				
				// Suspending slideshow
				sus = to;
				
				if (sus) {
					to = clearTimeout(to);
					// stopAuto();
				}
					
				if (im.data(id.isvideo)) {
					// Video
					var gw = gallery.width() - 40, gh = gallery.height() - 40;
					//h += getPlayerControlHeight(im.data(id.link));
					if ( w > gw || h > gh ) {
						var r = Math.min(gw / w, gh / h);
						w = Math.round(w * r);
						h = Math.round(h * r);
					}
					wr.addClass(id.video);
				} else {
					// Audio
					w = Math.max(240, im.data(id.width) || 0);
					h = Math.max(180, im.data(id.height) || 0);
					wr.addClass(id.audio);
				}
				
				// var nm = 'media' + curr;
				// Adding the thumbnail with a link to the original file
				wr.css({
						width: 		w,
						height: 	h
					}).data({
						ow: 		w, 
						oh: 		h 
					});
									
				setTimeout(function() {
						
					el = wr.addPlayer({
						src: 		im.data(id.link),
						title: 		settings.showVideoTitle? im.attr('alt') : '',
						poster: 	im.data(id.poster),
						play: 		videoStartedFn,
						ended: 		videoEndedFn,
						resPath: 	settings.resPath
					});
					
				}, settings.speed / 3);
				
				imgReady(wr);
					
			} else {
				
				// Picture
				w = im.data(id.width);
				h = im.data(id.height);
				
				var img = $(new Image());
				
				wr.addClass(id.image).append(img).css({
						width:		w,
						height: 	h
					}).data({
						ow: 		w, 
						oh: 		h 
					});
				
				img.attr({
						src: 		src, 
						width: 		w || 'auto', 
						height: 	h || 'auto' 
					});
				
				if (img[0].complete) {
					im.data('cached', true);
					imgReady( wr );
				} else {
					img.on('load', function() { 
						im.data('cached', true);
						imgReady(wr);
					}).prop({
						src: 	src
					});
				}	
			}
			
			if ((el = a.find('.checkbox')).length) {
				wr.append(el = el.clone());
				el.on('click', function(e) {
					e.preventDefault();
					var sel = $(this).hasClass(id.active);
					$(this).toggleClass(id.active, !sel);
					images.filter('.' + id.active).find('.' + id.checkbox).toggleClass(id.active, !sel);
					return false;
				});
			}
			
			// Appending bottom info panel
			createInfo(im, n);
			
		};
		
		// Creating regions
		
		var createRegions = function( curr ) {
			var ra = cimg.find('nav a.' + id.regions + '-icon').eq(0);
			if (ra.length) {
				var im = images.eq(curr).find('img:first');
				ra.addRegions( cimg.find('.' + id.main).eq(0), im.data(id.regions) );
			}
		};
		
		// Activating actions attached to the image
		
		var tempLock = function(el) {
			if (el && el.length) {
				el.data(id.kill, true);
				setTimeout(function() {
					if (el) {
						el.removeData(id.kill);
					}
				}, 500);
			}
		};
		
		var clickForNextAction = function(e) {
			var el = $(e.target);
			if (!el.is('.' + id.main)) {
				el = el.parents('.' + id.main);
			}
			if (el.length && !el.data(id.kill)) {
				if (!el.data('scrolling')) {
					//log('next ' + el[0].draggable + (el[0].dragOn?'1':'0'));
					tempLock(el);
					//log('click: ' + el[0].id);
					if (e.pageX < (el.offset().left + el.outerWidth() / 2)) {
						previousImg();
					} else {
						nextImg();
					}
				}
				return false;
			}
			return true;
		};
		
		var mouseWheelAction = function( e, d ) {
			e.preventDefault();
			var el = $(e.target).parents('.' + id.img);
			if (!el.data(id.kill)) {
				tempLock(el);
				//log('wheel: ' + el[0].id);	
				if (d > 0) { 
					previousImg(); 
				}
				else { 
					nextImg(); 
				}
			}
			return false;
		};
		
		var setupActions = function(el) {
			
			// Prevent right click
			
			if (settings.rightClickProtect) {
				el.on('contextmenu', function(e) {
					e.preventDefault();
					return false;
				});
			}

			// Actions attached to images, delayed by half transition speed
			
			setTimeout(function() {
					
				// Mouse wheel -> prev / next image, delayed by 1/4 transition speed
				if (settings.enableMouseWheel) {
					cimg.on('mousewheel', mouseWheelAction);
				}
				
				// Swipe -> prev / next image
				el.addSwipe(nextImg, previousImg);
				
				// Showing on touch devices after image change and not slideshow on
				if (TOUCHENABLED && !to) {
					showCtrl();
				}
				
				// Touch image -> control box toggle
				el.on(TOUCH.END, function(e) {
					if (!e.target || 
						e.target.nodeName === 'A' || 
						$(e.target).parents('.' + id.bottom).length ||
						con || 
						el.data('scrolling') || 
						el.data('taplength') >= 600) {
						return true;
					}
					e.preventDefault();
					showCtrl();
					return false;
				});
				
				// Click event
				if (images.length > 1 || !dynamic) {
					// Click -> next image
					if (el.hasClass(id.image)) {
						if (settings.clickForNext) {
							el.on('click', clickForNextAction);
						}
					}
				}
				
			}, settings.speed / 2);
			
		};
		
		// cacheImg preloads one image
		
		var cacheImg = function( a ) {
			var src = a.attr('href'), 
				im = a.children('img').eq(0);
			
			if (!src || !im || im.data('cached') || im.data(id.isvideo) || im.data(id.isother)) {
				return;
			}
			
			$('<img>').on('load', function() {
					im.data('cached', true);
				}).attr({
					src: 	src
				});
		};
		
		// Preloading the neighboring pictures
		
		var preload = function() {
			
			if (curr < images.length - 1) {
				cacheImg(images.eq(curr + 1));
			}
			
			if (curr > 0) {
				cacheImg(images.eq(curr - 1));
			}
		};
		
		// Image is ready, attaching event listeners, and placing it
		
		var imgReady = function( o ) {

			// Hiding wait animation
			if (wait && wait.length) {
				if (settings.transitions) {
					wait.stop(true, false).animate({
							opacity: 	0
						}, {
							duration: 	100,
							complete: 	function() { 
											$(this).hide(); 
										}
						});
				} else {
					wait.hide();
				}	
			}
			
			if (dynamic) {
				
				// Normal gallery
				if (settings.transitions) {
				
					// Stopping previous image
					if (pimg) {
						pimg.stop(true, false).animate({ 
								opacity: 	0	
							}, settings.speed / 2, 'linear', function() {
								trashImg(pimg);
							});
					}
				} else {
					trashImg(pimg);
				}
				
				cimg.children().not('.' + id.bottom).remove();
				cimg.append(o);
				
			} else {
				
				// Slide page
				o = cimg.find('.' + id.main);
				if (!o.length) {
					return;
				}
			}
			
			var isimg = o.hasClass(id.image);
			setupActions(o);
			
			setTimeout(function() {
					
				// Showing the image - delayed by 50ms to allow time for building the bottom panel
				if (settings.transitions) {
					
					cimg.css({ 
							opacity: 		0, 
							display: 		'block' 
						}).animate({ 
							opacity: 		1
						}, {
							duration: 		settings.speed,
							complete: 		useCssFilter? function() { 
												cimg.css({ 
													filter: '' 
												});
											} : null
						}).centerThis({
							init: 			true,
							speed: 			Math.round(settings.speed * 0.75),
							marginTop: 		scrollboxHeight(),
							marginBottom: 	infoboxHeight(),
							preScale: 		isimg && settings.preScale,
							animate: 		isimg && settings.preScale && settings.preScale !== 1.0,
							fit: 			settings.fitImage
						});
				
				} else {
					
					cimg.show().centerThis({
							init: 			true,
							marginTop: 		scrollboxHeight(),
							marginBottom: 	infoboxHeight(),
							fit: 			settings.fitImage
						});
				
				}
																
				createRegions( curr );
				
			}, 50);
			
			// Handling preload, hystory
			if (dynamic) {
				preload();
			} else if (settings.slideshowOn) {
				startAuto();
			}
		};
		
		// Creating bottom info panel
		
		var createInfo = function(im, n) {
			
			var c, 
				m,
				d, 
				h, 
				tw = Math.round(cimg.width() * 0.8) - 30,
				isimg = !(im.data(id.isvideo) || im.data(id.isaudio) || im.data(id.isother)),
				src;
			
			if (dynamic) {
				
				// Creating bottom panel
				
				bottom = $('<div>', { 
						'class': 	id.bottom 
					}).appendTo( cimg );
									
				c = $('<div>', { 
						'class': 	id.cont
					}).appendTo(bottom);					
				
				if ((typeof n !== UNDEF) && settings.showImageNumbers) {
					c.append('<h4 class="nr"><strong>' + (n + 1) + '</strong> / ' + images.length + '</h4>');
				}
				
				// Adding caption
				
				if ((d = im.data(id.caption))) {
					c.append(d);
				}
				
				src = im.data(id.src).replace(settings.thumbs + '/', settings.slides + '/');
				
			} else {
				
				c = bottom.children('.' + id.cont);
				src = im.attr('src');
			
			}
			
			// Buttons
			
			m = $('<nav>', {
					'class': 	'buttons'	
				}).prependTo(c);
			
			// Setting max width for the container
			
			if (c.width() > tw) {
				c.width(tw);
			}				
			
			// Button clicked event
			
			var clicked = function(e) {
				e.preventDefault();
				
				var a = $(e.target),
					t = a.data('rel'),
					p = c.children('.' + t),
					on = p.is(':visible'),
					ih = infoboxHeight(),
					ph = p.outerHeight(true);
				
				a.toggleClass(id.active, !on);
				
				if (t === id.map) {
					var ma = function() {
							if (!on) {
								p.children('.' + id.mapcont).trigger('adjust'); 
							}
						};
						
					if (settings.transitions) {
						p.slideToggle('fast', ma);
					} else {
						p.toggle();
						setTimeout(ma, 50);
					}
				} else {
					if (settings.transitions) {
						p.slideToggle('fast');
					} else {
						p.toggle();
					}
				}
				
				if (cimg && settings.fitFreespace) {
					cimg.centerThis( { 
							fit: 			settings.fitImage, 
							marginTop: 		scrollboxHeight(),
							marginBottom: 	ih + (on? -ph : ph)
						});
				}
				
				saveSetting(t + 'On', !on);
				
				return false;
			};
			
			var addPanel = function(name, top) {
				var e = $('<div>', {
						'class': 	id.panel + ' ' + name 
					}).data('rel', name);
				
				if (top) {
					// adding at top
					var be = c.find('.'+id.panel).eq(0);
					if (be.length) {
						e = e.insertBefore(be);
					} else {
						e = e.appendTo(c);
					}
				} else {
					// bottom
					e = e.appendTo(c);
				}
				
				// adding icon
				e.append($('<div>', { 
						'class': id.icon 
					}));
				
				return e;
			};
			
			var addButton = function(name) {
				var a = $('<a>', { 
						'class': 	name + '-' + id.icon
					}).data('rel', name).appendTo(m);
				
				if (settings.buttonLabels) {
					a.text(text[name + 'Btn'] || name);
				}
				
				a.addTooltip(text[name + 'Label'] || (settings.buttonLabels? '' : (text[name + 'Btn'] || name)));
				a.on('click', clicked);
				
				return a;
			};
			
			// Adding 'share' button
			
			if (settings.shareSlides) {
				var sha;
				
				if (settings.shareInline) {
					sha = addPanel(id.share, true);
					addButton(id.share);
					sha = $('<div>', {
							'class': 	id.shares
						}).css('min-height', '25px').appendTo(sha);
				} else {
					sha =  $('<a>', { 
							'class': 	id.share + '-' + id.icon
						}).appendTo(m);
					
					if (settings.buttonLabels) {
						sha.text( text.shareBtn ); 
					}
				}
					
				if (dynamic) {
					h = (settings.hash === 'number')? (curr + 1) : getCurrFile();
					
					setTimeout(function() {
						sha.addSocial({ 
								hash: 			h,
								inline: 		settings.shareInline,
								buttonLabels: 	settings.shareLabels, 
								title: 			(im.data(id.caption) || '').stripHTML(true),
								image: 			src
							});
					}, settings.speed / 2 );
					
				} else {
					
					sha.addSocial({
							useHash: 		false,
							inline: 		settings.shareInline,
							buttonLabels: 	settings.shareLabels,
							title: 			(im.data(id.caption) || '').stripHTML(true),
							image: 			src
						});
				}
			}
			
			// Facebook / Disqus commenting on slides
			
			var e;
			
			if (!dynamic && (e = c.children('.' + id.comments)).length) {
				e.data('rel', id.comments);
				addButton(id.comments);
			}
			
			// Creating buttons, panels
			
			var t, panel = [ id.meta, id.map, id.shop, id.print ];
			
			for (var i = 0; i < panel.length; i++) {
				t = panel[i];
				
				if (im.data(t) != null && (t != id.map || settings.mapOnSlide)) {
					addPanel(t);
					addButton(t);
				}
			}
			
			// Photos only:
			
			if (isimg) {
				
				// Adding 'Print' button
				
				if (settings.printOn) {
					var pa = $('<a>', { 
							'class': 	id.print + '-' + id.icon,
							text: 		(settings.buttonLabels? text.printBtn : '')
						});
					
					pa.addTooltip(text.printLabel);
					
					setTimeout(function() {
						pa.on('click', function(e) {
							printImage(im.data(id.link) || src,
								im.attr('alt') || '',
								im.data(id.caption) || ''
							);
						});
					}, settings.speed);
					
					m.append(pa);
				}
				
				// Adding 'fotomoto' button
				
				if (settings.fotomotoOn) {
					var fa = $('<a>', { 
							'class': id.fotomoto + '-' + id.icon,
							text: (settings.buttonLabels? text.fotomotoBtn:'')
						});
					
					fa.addTooltip(LOCAL? text.locationWarning : ('<h5>Fotomoto</h5>' + text.fotomotoLabel));
					
					setTimeout(function() {
						fa.on('click', function(e) {
							if (typeof FOTOMOTO !== UNDEF && !LOCAL) {
								FOTOMOTO.API.showWindow( 10, 
									im.data(id.link) || src
								);
							}
						});
					}, settings.speed);
					
					m.append(fa);
				}

				// Adding 'mostphotos' button
				
				if (d = im.data(id.mostphotos)) {
					if (!d.startsWith('http')) {
						d = 'https://www.mostphotos.com/' + d;
					}
					
					var ma = $('<a>', { 
							href: 		d, 
							'class': 	id.mostphotos + '-' + id.icon,
							text: 		(settings.buttonLabels? text.mostphotosBtn:''),
							target: 	'_blank'
						}).appendTo(m);
					
					ma.addTooltip('<h5>' + text.mostphotosBtn + '</h5>' + text.mostphotosLabel);						
				}
				
				// Adding 'regions' button
				
				if (im.data(id.regions)) {
					var ra =  $('<a>', { 
							'class': id.regions + '-' + id.icon
						});
					
					if ( settings.buttonLabels ) {
						ra.text(text.people);
					}
					
					if ( settings[id.regions + 'On'] ) {
						ra.addClass( id.active );
					}
					
					ra.on('click', function() { 
						saveSetting(id.regions + 'On', !$(this).hasClass( id.active ));
					});
					
					m.append(ra);
				}
			}
			
			// Adding 'download' button
			
			d = im.data(id.link);
			var xs = isimg && settings.hasOwnProperty('extraSizes') && src.hasExt('jpg,png,jpeg');
			
			if (xs || (d && ((!isimg && settings.downloadNonImages) || 
				(isimg && !settings.rightClickProtect)))) {
				var fn = src.getFile(),
					tt = $('<div>'),
					a = $('<a>', { 
							href: 		d, 
							'class': 	id.link + '-' + id.icon,
							download: 	'',
							target: 	'_blank'
						});
				
				if (settings.buttonLabels) {
					if (settings.hasOwnProperty('extraSizes')) {
						a.text(text.download)
					} else if (im.data(id.isoriginal)) {
						a.text(text.original);
					} else {
						a.text(text.hiRes);
					}
				}
				
				tt.append($('<h5>', {
						text: 		text.download
					}));
				
				var dl = $('<div>', {
						'class': 	'sizes'
					}).appendTo(tt);
				
				if (xs) {
					var sz = settings.extraSizes.split(',');
					for (var i = 0; i < sz.length; i++) {
						dl.append($('<a>', {
							href: 		(dynamic? '' : '../') + 'dl/' + sz[i] + '/' + fn,
							text: 		sz[i],
							download: 	''
						}));
					}
				}
					
				if (d) {
					dl.append($('<a>', {
							href: 		d,
							text: 		im.data(id.isoriginal)? text.original : text.hiRes,
							download: 	''
						}));
					tt.append($('<input>', {
							'class': 	'fullw',
							type: 		'text',
							value: 		d.fullUrl(),
							readonly: 	''
						}));
					if (!('download' in a[0])) {
						tt.append($('<small>', {
								html: 		text.saveTip
							}));
					}
				}
				
				a.addTooltip(tt, {
						touchToggle:	true,
						stay: 			5000
					});
				
				m.append(a);
			}
			
			// Adding custom Image Hook panel
			
			if (settings.imgHook) {
				
				var shh = $('<a>', {
						//href: '',
						'class': 	id.custom + '-' + id.icon
					});
				
				if (settings.buttonLabels && settings.imgHookBtn) {
					shh.text( settings.imgHookBtn );
				}
				
				shh.on('click', function(e) {
					e.preventDefault();
					var fn = im.data(id.link) || (dynamic? im.data(id.src) : im.attr('src')).replace(settings.thumbs + '/', '');
					$body.addModal( $(settings.imgHook.replace(/\%fileName\%/g, fn)), {
						uid: 			id.custom,
						width: 			settings.imgHookWidth || 600,
						title: 			settings.imgHookBtn,
						defaultButton: 	'okButton',
						resizable: 		true,
						savePosition: 	true
					});
					return false;
				});
				
				m.append(shh);
			}
			
			// Calling image ready function if defined
			
			if (settings.imgHookFn && $.isFunction(settings.imgHookFn)) {
				settings.imgHookFn.call(im);
			}
			
			// Appending to current image layer
			
			// cimg.append( bottom );
			
			// Adding content
			
			c.children('.' + id.panel).each(function() {
				
				var e = $(this),
					t = e.data('rel');
				
				if (t && (d = im.data(t)) !== null) {
					
					if (t === id.map) {
						
						var mc = $('<div>', { 
								'class': id.mapcont 
							}).appendTo(e);
						
						mc.width(c.width() - 30);
						
						if (settings.mapAll) {
							
							var markerClick = function() {
									if (dynamic) {
										showImg(this.link);
									} else {
										window.location.href = this.link;
									}
								};
							
							mc.addMap({
									click: 		markerClick,
									markers: 	markers,
									curr: 		parseInt(dynamic? im.data(id.mapid) : thumbs.filter('.' + id.active).find('img:first').data(id.mapid), 10)
								});
							
						} else {
							var l = (im.data(id.caption) || '').stripHTML() || im.attr('alt') || ((curr + 1) + '');
							mc.addMap({
									map: 	d,
									label: 	l
								});
						}
						
						setTimeout(function() {
							mc.trigger('adjust');
						}, settings.speed);

					} else if (t === id.shop) {
						var op = {};
						if (d !== '+') {
							op.options = d;
						}
						if ((d = im.data(id.discount)) !== null) {
							op.discount = d;
						}
						e.addShop(im.closest('a'), op);
						
					} else {
						e.append(d);
					}
					
					// Setting up visibility
					
					if (!settings[t + 'On']) {
						e.hide();
					} else {
						m.children('a.' + t + '-icon').addClass(id.active);
					}
				}
			});
							
			// No buttons added? > Remove menu
			
			if (!m.html().length) {
				m.remove();
			}
			
			// Hide the whole panel
			
			if (!settings.infoOn) {
				bottom.hide();
			}
			
		};
		
		// Sending feedback
		
		var sendFeedback = function() {
			
			var el = $('<div>', {
					'class': id.feedback
				});
						
			var f = $('<form>', {
					id: id.feedback
				}).appendTo(el);
			
			if (settings.directKey) {
				f.append('<input type="hidden" name="from" value="' + settings.feedbackEmail.replace('|','@') + '">');
				f.append('<input type="hidden" name="to" value="' + xDecrypt(settings.directKey) + '">');
				f.append($('<p class="email"><label for="email">' + text.yourEmail + '</label>' +
					'<input id="email" name="email" type="email"></p>'));
			}
			
			f.append($('<p class="subject"><label for="subject">' + text.subject + '</label>' +
				'<input id="subject" name="subject" value="' + settings.albumName + (settings.relPath.length? ('/' + settings.relPath):'') + '"></p>'));
			
			f.append($('<p class="message"><label for="message">' + text.message + '</label>' +
				'<textarea id="message" name="message"></textarea></p>'));
			
			images.filter(function() { 
				return $(this).children('.' + id.active).length; 
			}).each(function(i) {
				var im = $(this).find('img').eq(0),
					t = im.data('src'),
					fn = ((im.data(id.isimage) || im.data(id.isother))? t : (im.data('link') || '')).getFile(),
					link = dynamic? (window.location.href.split('#')[0] + '#' + encodeURIComponent(fn)) : (window.location.href.getDir() + $(this).attr('href'));
					
				f.append($('<div><aside><img src="' + t + '"></aside><div><a class="remove">&times;</a><label for="img' + i + '">' + fn + '</label>' +
					'<input type="hidden" name="file[' + (i + 1) + ']" value="' + link + '">' +
					'<textarea id="img' + i + '" name="comment[' + (i + 1) + ']" placeholder="' + text.comment + '"></textarea></div></div>'));
			});
			
			f.find('a.remove').on('click', function(e){
				e.preventDefault();
				$(this).parents('div').eq(1).remove();
				return false;
			});
			
			var submitForm = function(w) {
				if (!w || !w.length) {
					if (console)
						console.log('Submitform Error: Missing form');
					return false;
				}
				
				var v,  
					err = false,
					f = w.find('form').eq(0), 
					url = window.location.href.split('#')[0];
				
				if (settings.directKey) {
										
					v = f.find('input#email').val();
				
					if (!v.length || !v.match(/^\S+@\S+[\.][0-9a-z]+$/)) {
						$body.addModal($('<div>', {
							html: 	text.emailMissing
						}), {
							type: 	'error'
						});
						return false;
					}
					
					var callback = function( data ) {
						if (data.Result === 'Ok') {
							$body.addModal($('<div>', {
								html: text.messageSent
							}), {
								autoFade: 1500
							});
						} else {
							err = true;
							if (DEBUG && console) {
								console.log('Error sending mail: Result=' + data.Result + ' Cause=' + data.Cause);
							}
							$body.addModal($('<div>', {
								html: 	'<h3>' + text.errorSending + '</h3><p class="err">' + data.Result + ', ' + data.Cause + '</p>'
							}), {
								type: 	'error'
							});
						}
					};
				   
					$.ajax({
						url: 		'https://jalbum.net/integration/api/sendmail.json',
						dataType: 	'jsonp',
						data: 		f.serialize(),
						success: 	function(data) { 
										callback(data); 
									}
					});
					
					if (err) {
						return false;
					}
					
				} else if (settings.php) { 
				
					$.ajax({
						url: 		resPath + 'feddback.php',
						type: 		'POST',
						data: 		{
										'message': 	f.serialize(),
										'subject': 	'Subject of your e-mail'
									},
						success: 	function(data) {
										alert('You data has been successfully e-mailed');
										alert('Your server-side script said: ' + data);
									}
					});

				} else {
				
					var s = 'mailto:' + encodeURIComponent(settings.feedbackEmail.replace('|', '@')) +
							'?subject=' + encodeURIComponent(f.find('input#subject').val()) +
							'&body=';
							
					if (v = f.find('textarea#message').val()) {
						s += encodeURIComponent(v + '\n\n');
					}
					
					f.children('div').each(function(i) {
						s += encodeURIComponent((i + 1) + '. ' + $(this).find('input[type=hidden]').val() + '\n');
						if (v = $(this).find('textarea').val()) {
							s += encodeURIComponent(v + '\n');
						}
						s += encodeURIComponent('\n');
					});
					
					if (s.length > 2048) {
						$body.addModal($('<div>', {
								html: 	'<p>' + text.tooLong + '</p>'
							}), {
								type: 	'error'
							});
						
						return false;
					}
					window.location.href = s;
				}
				
				return true;
			};
			
			f.on('submit', function() {
				return submitForm($('#feedback'));
			});
								
			$body.addModal(el, [{
				t: 				text.send,
				h: 				submitForm
			}], {
				uid: 			'feedback',
				enableKeyboard: false,
				title: 			text.sendFeedback,
				width: 			480,
				resizable: 		true,
				savePosition: 	true
			});
			
			return false;
		};
		
		// Buying multiple items 
		
		var shopAll = function() {
			var ns = false,
				it = images.filter(function() {
						var t = $(this), 
							d;
							
						if (t.children('.'+id.checkbox).hasClass(id.active)) {
							// Filter only items with global shop options
							t = t.children('img:first');
							d = t.data(id.shop);
							ns = true;
							return !(d && d !== '+' || t.data(id.discount));
						}
						return false;
					});
			
			if (it.length === 0) {
				$body.addModal($('<h3>' + text.noItemsSelected + '</h3><p>' + (ns? text.nonShoppableItems : text.selectItemsHint) + '</p>'), {
					type: 	'warning'
				});
				return;
			}
			
			var el = $('<div>', {
						'class': 	id.shopAll
					}),
				url = window.location.href.getDir(),
				tl = $('<ul>', {
						'class': 	id.thumbs
					}).appendTo(el);
			
			it.each(function() {
				tl.append($('<li>').append($('<img>', {
					src: $(this).children('img:first').data('src')
				})));
			});
					
			var sh = $('<div>', {
					'class': 	id.shop
				}).appendTo(el);
			
			sh.addShop(it);
			
			$body.addModal(el, {
					uid: 			id.shopAll + 'w',
					title: 			text.buyNItems.replace("{0}", it.length),
					width: 			640,
					resizable: 		true,
					savePosition: 	true,
					enableKeyboard: false,
					blocking: 		true,
					defaultButton: 	'close'
				});
			
		};
		
		// Creating control bar
		
		var createControls = function() {
			
			controls = $('<nav>', { 
					'class': 	id.controls + ' clearfix'
				}).appendTo(navigation);
			
			// Previous button
			
			ctrl.prev = $('<a>', { 
					'class': 	id.prev, 
					title: 		text.previousPicture 
				}).appendTo(controls);
			
			// Up button
			
			if (!settings.skipIndex || settings.level || settings.uplink) { 
				ctrl.up = $('<a>', { 
						'class': 	id.up, 
						title: 		settings.skipIndex? text.upOneLevel : text.backToIndex 
					}).appendTo(controls);
			}
			
			// Fit / 1:1 button
			
			ctrl.noresize = $('<a>', { 
					'class': 	id.noresize, 
					title: 		text.oneToOneSize 
				}).appendTo(controls);
			
			ctrl.resize = $('<a>', { 
					'class': 	id.resize, 
					title: 		text.fitToScreen 
				}).appendTo(controls);
			
			if (settings.hideFitBtn) {
				ctrl.resize.add(ctrl.noresize).hide();
			} else {
				ctrl.resize.togglein(!settings.fitImage); 
				ctrl.noresize.togglein(settings.fitImage);
			}
			
			// Thumbnail panel toggle button		
			
			ctrl.hideThumbs = $('<a>', { 
					'class': 	id.hideThumbs, 
					title: 		text.hideThumbs 
				}).appendTo(controls);
			
			ctrl.showThumbs = $('<a>', { 
					'class': 	id.showThumbs, 
					title: 		text.showThumbs 
				}).appendTo(controls);
			
			ctrl.showThumbs.togglein(!settings.thumbsOn); 
			ctrl.hideThumbs.togglein(settings.thumbsOn); 
			
			// Info panel toggle button		
			
			ctrl.hideInfo = $('<a>', { 
					'class': 	id.hideInfo, 
					title: 		text.hideInfo 
				}).appendTo(controls);
			
			ctrl.showInfo = $('<a>', { 
					'class': 	id.showInfo, 
					title: 		text.showInfo 
				}).appendTo(controls);
			
			ctrl.showInfo.togglein(!settings.infoOn); 
			ctrl.hideInfo.togglein(settings.infoOn); 
			
			// Play / pause button		

			ctrl.play = $('<a>', { 
					'class': 	id.play, 
					title: 		text.startAutoplay
				}).appendTo(controls);
			
			ctrl.pause = $('<a>', { 
					'class': 	id.pause, 
					title: 		text.stopAutoplay 
				}).appendTo(controls);
			
			if (images.length > 1 || settings.afterLast === 'nextfolder') {
				ctrl.play.togglein(!settings.slideshowAuto); 
				ctrl.pause.togglein(settings.slideshowAuto);
			} else {
				ctrl.play.add(ctrl.pause).hide();
			}
			
			// Next image button		

			ctrl.next = $('<a>', { 
					'class': 	id.next, 
					title: 		text.nextPicture 
				}).appendTo(controls);
			
		};
		
		// Setting up control bar actions
		
		var setupControlBehavior = function() {
			
			// Calculating width
			
			var w = 0;
			
			controls.children().each(function() { 
				if ($(this).css('display') !== 'none') {
					w += $(this).outerWidth();
				}
			});
			
			controls.css({
				marginLeft: -Math.floor(w/2)
			});
			
			controls.children('a').not(ctrl.play).addTooltip({ 
				delay: 	500 
			});
			
			var sd = $('<div>', {
					'class': 	'slideshowdelay',
					text: 		ctrl.play.prop('title')
				}),
				f = $('<form>').appendTo(sd);
			
			f.on('submit', function(e) {
					e.preventDefault();
					startAuto();
					return false;
				}).append($('<input>', {
						type: 	'text',
						value: 	settings.slideshowDelay / 1000
					}).focus().on('change', function() {
						saveSetting('slideshowDelay', Math.round(parseFloat($(this).val() * 1000) || $.fn.turtle.defaults.slideshowDelay));
						return true;
					})
				).append($('<a>', {
						'class': 	'button',
						//href: 	NOLINK,
						text: 		' '
					}).on('click', playClick) 
				);
			//f.find('input');
			
			ctrl.play.prop('title', '').addTooltip(sd, {
				stay: 	5000
			});
			
			if (!TOUCHENABLED) {
				if (dynamic) {
					controls.hide();
				} else {
					cto = setTimeout(function() { 
						fadeCtrl();
					}, 1500);
				}
			}
			
			// Saving mouse over state
			controls.on({
				mouseenter: function() { 
					cmo = true; 
					$(this).stop(true, false).fadeTo(200, 1.0);
				},
				mouseleave: function() { 
					cmo = false;
					$(this).stop(true, false).fadeTo(200, 0.8);
				}
			});
			
			// showing control bar on mousemove
				
			gallery.on('mousemove', function(e) {
				if (!smo && ((mly - e.clientY) || (mlx - e.clientX))) {
					if (mlx >= 0) { 
						// Not first event
						showCtrl();
					}
					mlx = e.clientX;
					mly = e.clientY; 
				}
			});
		};
		
		// Initializng the control bar
		
		var prevClick = function(e) {
			e.preventDefault();
			stopAuto(); 
			previousImg(); 
			return false; 
		};
		
		var upClick = function(e) {
			e.preventDefault();
			stopAuto();
			backToIndex(); 
			return false; 
		};
		
		var upClickSlide = function() {
			if (settings.curr) {
				$.cookie('curr:' + settings.albumName + '/' + settings.relPath, settings.curr, 600);
			}
			return true;
		}
		
		var noresizeClick = function(e) {
			e.preventDefault();
			zoomReset(); 
			return false; 
		};
		
		var resizeClick = function(e) {
			e.preventDefault();
			zoomFit(); 
			return false; 
		};
		
		var hideInfoClick = function(e) {
			e.preventDefault();
			hideCaption(); 
			return false; 
		};
		
		var showInfoClick = function(e) {
			e.preventDefault();
			showCaption(); 
			return false; 
		};
		
		var hideThumbsClick = function(e) {
			e.preventDefault();
			hideScrollbox(); 
			return false; 
		};
		
		var showThumbsClick = function(e) {
			e.preventDefault();
			showScrollbox(); 
			return false; 
		};
		
		var playClick = function(e) {
			e.preventDefault();
			if (dynamic && settings.slideshowFullScreen) {
				cmo = false;
				$('html').fullScreen( true );
			}
			startAuto(); 
			return false; 
		};
		
		var pauseClick = function(e) {
			e.preventDefault();
			stopAuto(); 
			return false; 
		};
		
		var nextClick = function(e) {
			e.preventDefault();
			keepAuto(); 
			nextImg(); 
			return false; 
		};
		
		var setupControls = function() {
			
			createControls();
			
			ctrl.prev.on('click', prevClick);
			if (ctrl.up) ctrl.up.on('click', upClick);
			ctrl.noresize.on('click', noresizeClick);
			ctrl.resize.on('click', resizeClick);
			ctrl.hideInfo.on('click', hideInfoClick);
			ctrl.showInfo.on('click', showInfoClick);
			ctrl.hideThumbs.on('click', hideThumbsClick);
			ctrl.showThumbs.on('click', showThumbsClick);
			ctrl.play.on('click', playClick);
			ctrl.pause.on('click', pauseClick);
			ctrl.next.on('click', nextClick);
							
			setupControlBehavior();
		};
		
		// Initializing the control bar for the slide page
		
		var setupSlideControls = function() {
			
			ctrl.prev = controls.children('.' + id.prev);
			ctrl.up = controls.children('.' + id.up);
			ctrl.noresize = controls.children('.' + id.noresize);
			ctrl.resize = controls.children('.' + id.resize);
			ctrl.hideInfo = controls.children('.' + id.hideInfo);
			ctrl.showInfo = controls.children('.' + id.showInfo);
			ctrl.hideThumbs = controls.children('.' + id.hideThumbs);
			ctrl.showThumbs = controls.children('.' + id.showThumbs);
			ctrl.play = controls.children('.' + id.play);
			ctrl.pause = controls.children('.' + id.pause);
			ctrl.next = controls.children('.' + id.next);
			
			if (scrollbox.find('.'+id.cont+' a').length > 1) {
				ctrl.play.togglein(!settings.slideshowAuto); 
				ctrl.pause.togglein(settings.slideshowAuto);
			} else {
				ctrl.play.add(ctrl.pause).hide();
			}
			
			if (settings.hideFitBtn) {
				ctrl.resize.add(ctrl.noresize).hide();
			}
			
			if (ctrl.up) ctrl.up.on('click', upClickSlide);
			ctrl.noresize.on('click', noresizeClick);
			ctrl.resize.on('click', resizeClick);
			ctrl.hideInfo.on('click', hideInfoClick);
			ctrl.showInfo.on('click', showInfoClick);
			ctrl.hideThumbs.on('click', hideThumbsClick);
			ctrl.showThumbs.on('click', showThumbsClick);
			ctrl.play.on('click', playClick);
			ctrl.pause.on('click', pauseClick);
			ctrl.next.on('click', nextClick);
			
			setupControlBehavior();
		};

		// Setting up thumbnails
		
		var setupThumbs = function() {
			var t, im, h;
			
			var saveCurr = function() {
				var c = images.index($(this));
				if (c) {
					$.cookie('curr:' + settings.albumName + '/' + settings.relPath, c, settings.keepPrefs);
				}
			};
		
			images.each( function() {
				
				t = $(this);
				im = t.find('img').eq(0);
				if (!im.length) {
					return;
				}
									
				// Right-click protection
				if (settings.rightClickProtect) {
					t.on('contextmenu', function(e) {
						e.preventDefault();
						return false;
					});
				}
				
				// Mark thumbnails to be loaded later
				if (im.attr('src').endsWith('/' + settings.loadImg)) {
					im.addClass(id.toload);
				}
									
				// Mark as new
				if (settings.markNewDays && 
					(today - parseInt(im.data(id.modified) || 0, 10)) <= settings.markNewDays) {
					t.append($('<span>', {
						'class': 	id.newItem,
						text: 		text.newItem
					}));
				}
				
				// Adding mouseover hint
				t.addTooltip({
						delay: 	500
					});
						
				// Saving the current element when navigating away
				if (!dynamic) {
					images.on('click', saveCurr);
				}
			
			});
							
			// Loading the thumbnails for the first time
			setTimeout(function(){
				items.loadImages();
				// second attempt after rendering
				setTimeout(function(){
					items.loadImages();
				}, 1200);
			}, 100);
			/*
			var loadImgs = function() {
				items.loadImages();
				return true;
			};
			*/
			// Setting up the checkboxes
			setupCheckboxes();
			
			$('#' + id.selectAll).on('click', function(e) {
				e.preventDefault();
				selectAll(true);
				return false;
			});
			
			$('#' + id.selectNone).on('click', function(e) {
				e.preventDefault();
				selectAll(false)
				return false;
			});
			
			// Buy button
			$('#' + id.shopAll).on('click', shopAll);

		};
		
		// Setting up folders
		
		var setupFolders = function() {
			
			items.find('.' + id.folders).on('click', function() {
				$.cookie('curr:' + settings.albumName + '/' + settings.relPath, null);
				return true;
			});
		};
		
		// Copying thumbnails to gallery page
		
		var setupThumbScroller = function() {
			var t, 
				el, 
				i, 
				im, 
				tc, 
				w = 0, 
				rw, 
				rh, 
				tw, 
				th, 
				r, 
				nl;
			
			// Creating structure: <div class=""><div class="wrap"><ul>...</ul></div></div>
			scrollbox = $('<div>', { 
					'class': 	id.scrollbox 
				}).appendTo(navigation);
			
			tc = $('<div>', { 
					'class': 	'wrap' 
				}).appendTo(scrollbox);
			
			tc = $('<ul>', { 
					'class': 	id.cont + ' ' + id.load
				}).appendTo(tc);
			
			images.each(function() {
				
				t = $(this);
				im = t.find('img').eq(0);
				if (!im.length) {
					return;
				}
				
				// Adding thumb: <li><a><img/></a></li>
				el = $('<a>', { 
						href: NOLINK 
					}).appendTo($('<li>').appendTo(tc));
				
				// Reduced dimensions (calculated only once)
				if (!rw) {
					if (isNaN(rw = parseInt(el.css('width'),10))) {
						rw = 133;
					}
					if (isNaN(rh = parseInt(el.css('height'),10))) {
						rh = 100;
					}
				}
				
				// Normalizing to fit
				tw = im.attr('width');
				th = im.attr('height');
				if ( tw > rw || th > rh ) {
					if (tw / rw > th / rh) {
						th = Math.round(th * rw / tw);
						tw = rw;
					} else {
						tw = Math.round(tw * rh / th);
						th = rh;
					}
				}		
				
				// Adding image
				
				i = $('<img>', {
						src: 		im.attr('src'),
						'class': 	im.attr('class')
					}).data({
						src: 		im.data('src') 
					}).appendTo(el);
				
				if (tw && th) {
					i.attr({
						width: 		tw,
						height: 	th
					});
				}
				
				// New label
				
				nl = t.children('.' + id.newItem);
				if (nl.length) {
					el.append(nl.clone());
				}
				
				// Adding mouse over hint
				
				el.addTooltip(t.data('hint') || t.siblings('.' + id.caption).html(), {
					delay: 	500
				});
												
				//w += a.outerWidth();

			});
			
			// Setting width with margins added
			
			el = tc.children('li').first();
			if (el.length) {
				if (isNaN(w = parseInt(el.css('width'),10))) {
					w = 135;
				} else {
					w += (parseInt(el.css('marginLeft'),10) || 0) +
						(parseInt(el.css('marginRight'),10) || 0);
				}
	
				tc.width(w * tc.children().length + 2);
			}
			
			// Adding scroller
			
			tc.scrollThumbs({
				enableMouseWheel: 	settings.enableMouseWheel
			});
					
			thumbs = scrollbox.find('li > a');
			thumbs.on('click', function() {
					if ($(this).parents('[data-custom-scroll]').data('scrolling')) {
						return false;
					}
					$body.hideAllTooltips();
					if (!$(this).hasClass(id.active)) {
						stopAuto();
						showImg(thumbs.index($(this)));
					}
					setActive();
					return false;
				});
		};
		
		// Initializing thumbs on the slide pages
		
		var setupSlideThumbs = function() {
			
			var tc = scrollbox.find('.' + id.cont), 
				w = 0;
			
			thumbs.addTooltip({
					delay: 	500		
				}).each(function() { 
					w += $(this).outerWidth();
				});
			
			// Setting width with margins added
			w +=  thumbs.length * 2;
			tc.width(w);
			
			tc.scrollThumbs({
					enableMouseWheel: 	settings.enableMouseWheel
				});
			
			thumbs.on('click', function() {
				return !$(this).parents('[data-custom-scroll]').data('scrolling');
			});
			
			tc.trigger('setactive');
			
			if (!settings.thumbsOn) {
				navigation.css('top', -scrollbox.outerHeight() - 10);
			}
		};
			
		// Initializing Turtle on the index page
		
		var initIndex = function() {
			
			// Setting up the header actions
			setupHeader($(settings.header));
			
			// Initializing thumbs and folders
			items = $('.' + id.items);
			if (images.length) {
				setupThumbs();
			}
			setupFolders();
			
			// Feedback button
			$('#' + id.feedback).on('click', sendFeedback);
			
			if (images.length) {
				
				// Finding all map coordinates
				if (settings.mapOnIndex || settings.mapAll && settings.mapOnSlide) {
					markers = images.collectMarkers({ 
							dynamic: 	dynamic 
						});
				}
			
				// Creating map on the index page
				if (settings.mapOnIndex && markers.length) {
					$('#' + id.map + ' .' + id.cont).addMap({
							click: 	function() {
											if ( dynamic ) {
												showImg(this.link);
											} else {
												window.location.href = this.link;
											}
										},
							markers: 	markers,
							range: 		999,
							curr: 		0
						});				
				}
			
				// Setting the active element
				if ((curr = $.cookie('curr:' + settings.albumName + '/' + settings.relPath)) === null ||
					curr >= images.length) {
					curr = 0;
					setActive(true);
				} else {
					setTimeout(function() {
						setActive();
					}, 300);
				}
				
				// Installing keyboard listener
				if (($.isFunction(settings.enableKeyboard) || settings.enableKeyboard)) {
					$window.on('keydown', keyhandler);
				}
			}
		};
		
		var initGallery = function() {
				
			// Click handler
			images.on('click', thumbClick);
				
			// Creating Turtle gallery structure
			
			// the main container
			gallery = $('<div>', { 
					'class': 	id.gallery 
				}).attr('data-role', 'gallery').appendTo($body);
			
			// wait layer
			wait = $('<div>', { 
					'class': 	id.wait 
				}).appendTo(gallery);
			
			// Navigation items
			navigation = $('<div>', { 
					'class': 	id.navigation 
				}).appendTo(gallery);
			
			// Creating the thumbnail scroller box
			setupThumbScroller();
			
			// Controls array
			setupControls();
			
			if (!settings.thumbsOn) {
				navigation.css('top', -scrollbox.outerHeight() - 10);
			}
			
			// Show / hide the control strip on mouse move
			scrollbox.on({
				mouseenter: function() { 
								fadeCtrl(); 
								smo = true; 
							},
				mouseleave: function() { 
								smo = false; 
							}
			});
				
			// Initializing history plugin
			if ($body.attr('id') !== 'page' && settings.hash && settings.hash !== 'no') {
				$.history.init(goHash);
			}
							
			// Starting slideshow
			var d = $.cookie('slideshowDelay');
			if (settings.slideshowAuto || (d && $.isNumeric(d))) {
				if (dynamic && settings.slideshowFullScreen) {
					$('html').fullScreen(true);
				}
				if (d && $.isNumeric(d)) {
					settings.slideshowDelay = d;
				}
				showImg( curr );
				startAuto();
			} else {
				stopAuto();
				if (settings.skipIndex) {
					showImg(curr);
				}
			}

			// Installing keyboard listener
			if (($.isFunction(settings.enableKeyboard) || settings.enableKeyboard)) {
				$window.on('keydown', galleryKeyhandler);
			}
		};
		
		// Initializing Slide page
					
		var initSlide = function() {
			
			gallery 	= $('.' + id.gallery);
			navigation 	= $('.' + id.navigation);
			controls 	= $('.' + id.controls);
			cimg 		= $('.' + id.img);
			bottom 		= $('.' + id.bottom);
			images 		= cimg.children('.' + id.main);
			curr 		= 0;
			scrollbox 	= $('.' + id.scrollbox);
			thumbs 		= scrollbox.find('li > a');

			var img 	= images.find('img:first');
			
			// Finding all map coordinates
			if (settings.mapAll) {
				markers = thumbs.collectMarkers();
			}
			
			// Scroll box
			setupSlideThumbs();
			
			// Control bar
			setupSlideControls();
			
			// Initializing panels
			initScrollbox();
			initCaption();
			initZoom();
			
			// Showing the image and placing center
			if (img.length) {
				if (images.hasClass(id.image) && !img[0].complete) {
					// Not in cache
					img.on('load', function() {
							img.data('cached', true);
							imgReady();	
						}).attr({
							src: 	img.attr('src') // fixing a bug in IE
						});
					wait = $('<div>', {
							'class': 	id.wait
						}).appendTo(gallery);
					wait.fadeIn();
				} else {
					// In cache
					img.data('cached', true);
					imgReady();
				}
				
				createInfo(img);
			}
							
			// Installing keyboard listener
			if (($.isFunction(settings.enableKeyboard) || settings.enableKeyboard)) {
				$window.on('keydown', galleryKeyhandler);
			}
			
			if (settings.clickBesideForIndex) {
				cimg.on('click', function(e) {
					if ($(e.target).hasClass(id.img)) {
						backToIndex();
						return false;
					}
					return true;
				});
			}
			
		};
		

		/////////////////////////////////
		//
		//   Starting  Turtle gallery
		//
		/////////////////////////////////
		
		// the images array passed to Turtle
		// Format
		// Index page: <ul><li><a><img></a></li>...</ul>
		// Slide page: <a></a> 
							
		if (index) {
			
			setTimeout(showNag, 1000);
			
			images = $(this).find('td > a');
			
			initIndex();
			
			if (images.length && dynamic) {
				initGallery();
			}
			
			if (settings.showCookiePolicy) { 
				setTimeout(showCookiePolicy, 2000);
			}
			
		} else {
			
			images = $(this);
			
			initSlide();
		}
		
		// Avoid submit event in textarea elements: adding line feed instead
		/*
		$document.on('keydown', function(e) {
			if (e.target.nodeName === 'TEXTAREA') {
				var k = e? e.keyCode : window.event.keyCode;
				if (k === 13 || k === 10) {
					if ($.getCursorPosition) {
						var el = $(e.target),
							i = el.getCursorPosition();
						el.val(el.val().substring(0,i) + '\n' + el.val().substring(i));
						el.setCursorPosition(i + 1);
					}
					e.preventDefault();
					return false;
				}
			}
			return true;
		});
		*/
		
		// Resize event
		if (images.length && dynamic || !page) {
			$window.on('resize orientationchange', windowResized);
		}
		
		return this;
		
	};
	
	// Default settings
	
	$.fn.turtle.defaults = {
		header: 			'#main header',		// Main header selector
		slides: 			'slides',			// Default slides folder name
		thumbs: 			'thumbs',			// Default thumbs folder name
		linkSlides: 		false,				// Separate slide pages mode
		loadImg: 			'blank.png',		// Default load image name
		hash: 				'fileName',			// Hash type: 'no' || 'number' || 'fileName'
		resPath: 			'res/',				// relative path to '/res' folder
		relPath: 			'',					// relative path from '/res' back to current folder
		level: 				0,					// gallery level (0 = top level)
		skipIndex: 			false,				// skip the index (thumbnail) page and goes straight to gallery
		showStart:			true,				// Show "Start slideshow" button
		keepPrefs: 			600,				// Time to keep preferences (s)
		speed: 				600,				// picture transition speed (ms)
		controlbarOpacity: 	0,					// opacity of control bar when the mouse is not over
		controlOutOpacity: 	0,					// minimum opacity of control bar 
		transitions: 		true,				// use transitions?
		preScale: 			0.95,				// size of the image before the transitions starts
		slideshowDelay: 	4000,				// slideshow delay 3 s
		slideshowLoop: 		false,				// automatically starts over
		slideshowAuto: 		false,				// automatically starts with the first image
		slideshowFullScreen: false, 			// go Full screen during slideshows?
		markNewDays: 		0,					// : days passed by considered a picture is 'new' :: 0 == no mark
		afterLast:			'ask',				// Deafult action after the last frame ( ask|backtoindex|onelevelup|startover )
		thumbsOn: 			false,				// Show the thumbnail scroller by default?
		
		fitImage: 			false,				// Fit the images to window size by default or use 1:1?
		fitShrinkonly: 		false,				// Fit only by shrinking (no enlarging)
		fitFreespace: 		true,				// Fit only the space below the thumbnail scroller
		hideFitBtn: 		false,				// Hide fit / 1:1 button?
		fitPadding: 		15,					// Distance from the window border
		borderWidth: 		10,					// Image border width
		
		clickForNext: 		true,				// Click through navigation
		clickBesideForIndex: false,				// Click beside for getting back to index
		rightClickProtect: 	false,				// No right-click menu on main images
		
		cookiePolicyStay: 	8,					// Delay for cookie policy message
		
		showImageNumbers: 	true,				// Show the actual image number on the info panel?
		buttonLabels: 		false,				// Show labels on the buttons?
		infoOn: 			true,				// Show bottom info panel?
		metaOn: 			false,				// Show Metadatas by default?
		
		mapOn: 				false,				// Map options
		mapOnIndex: 		false,
		mapOnSlide: 		false,
		mapType: 			'roadmap',
		mapZoom: 			18,
		mapAll: 			false,
		
		shopOn: 			true,				// Shopping options
		shopGateway: 		'paypal',
		shopCurrency: 		'USD',
		
		//fotomotoOn: 		false,				// Fotomoto panel
		shareOn: 			false,				// Sharing panel
		commentOn: 			false,				// Commenting panel
		printOn: 			false,				// Printing panel
		regionsOn: 			false,				// Show regions
		downloadNonImages: 	false,				// Enable download button for non-images
		
		enableKeyboard: 	true,				// Enable keyboard controls?
		enableMouseWheel: 	true,				// Enable mouse wheel?
		
		videoAuto: 			false,				// automatic play of videos
		videoMaximize: 		false,				// maximize to fit screen
		videoTitleOn:		false,				// display title
		prioritizeFlash: 	false,				// flash first
		
		scrollDuration: 	1000				// Image scroll duration when controlled from keyboard
	};
	
	// Class names and data- id's
	
	$.fn.turtle.ids = {	
		gallery: 			'gallery',			// The container for gallery
		items: 				'items',				// Items container = the scrollable area
		folders: 			'folders',			// folders
		thumbs: 			'thumbs',			// thumbnails
		navigation: 		'navigation',		// Navigation at top
		scrollbox: 			'scrollbox',		// Thumbnail scroller box
		active: 			'active',			// active state
		parent: 			'parent',			// up link
		bottom: 			'bottom',			// bottom section
		img: 				'img',				// one image
		main: 				'main',				// the main image class
		image: 				'image',			// image class
		video: 				'video',			// video class
		audio: 				'audio',			// audio class
		other: 				'other',			// other file panel class 
		wait: 				'wait',				// wait animation
		cont: 				'cont',				// inside containers generated by the script
		panel: 				'panel',			// general panel on the bottom
		icon: 				'icon',				// icon container
		caption: 			'caption',			// caption markup
		meta: 				'meta',				// metadata container / also the name of data attr
		map: 				'map',				// map container class
		mapcont: 			'mapcont',			// map inside wrapper
		mapid: 				'mapid',			// map marker unique id
		shop: 				'shop',				// shop container class
		shopAll: 			'shopall',			// shop multiple items
		discount: 			'discount',			// discount data
		fotomoto: 			'fotomoto',			// fotomoto class
		mostphotos: 		'mostphotos',		// mostphotos class
		share: 				'share',			// share container class
		shares: 			'shares',			// shares
		print: 				'print',			// print container class
		comments: 			'comments',			// commenting container class 
		link: 				'link',				// link to original / hi res.
		custom: 			'custom',			// custom button hooked on image
		poster: 			'poster',			// high res poster for audio and video
		isoriginal: 		'isoriginal',		// link points to original or hi res.?
		content: 			'content',			// content : iframe, html or link
		width: 				'width',			// width attribute
		height: 			'height',			// height attribute
		src: 				'src',				// source link
		ext: 				'ext',				// file extension
		thumbExt: 			'thumbext',			// thumbnail extension
		regions: 			'regions',			// Area tagging
		isimage: 			'isimage',			// is image attr
		isvideo: 			'isvideo',			// is video attr
		isaudio: 			'isaudio',			// is audio attr
		isother: 			'isother',			// is other attr
		modified: 			'modified',			// modified x days ago attr
		startShow: 			'startshow',		// Start Slideshow button
		startBtn: 			'startbtn',			// Button class
		startTxt: 			'starttxt',			// Start text class
		controls: 			'controls',
		prev: 				'prev',				// control strip classes
		next: 				'next',
		up: 				'up',
		noresize: 			'noresize',
		resize: 			'resize',
		hideInfo: 			'hideinfo',
		showInfo: 			'showinfo',
		hideThumbs: 		'hidethumbs',
		showThumbs: 		'showthumbs',
		play: 				'play',
		pause: 				'pause',
		newItem: 			'newlabel',
		kill: 				'kill',				// Image must not receive further events - an event is already processed
		load: 				'load',				// Element that holds loadable items
		toload: 			'toload',			// img.toload the images to load
		feedback: 			'feedback',			// feedback window
		checkbox: 			'checkbox',			// checkboxes
		selectAll: 			'selectall',		// select all
		selectNone: 		'selectnone'		// select none
	};

	// Texts to use as default
	
	$.fn.turtle.text = {
		startSlideshow: 	'Start slideshow',
		close: 				'Close',
		atLastPage: 		'At last page', 
		atLastPageQuestion: 'Where to go next?', 
		startOver: 			'Start over', 
		backToHome: 		'Back to home',
		stop: 				'Stop', 
		upOneLevel: 		'Up one level',
		backToIndex: 		'Back to index page',
		previousPicture: 	'Previous picture',
		nextPicture: 		'Next picture',
		previousFolder: 	'Previous folder',
		nextFolder: 		'Next folder',
		changeSpeed: 		'Change speed',
		oneToOneSize: 		'1:1 size',
		fitToScreen: 		'Fit to screen',
		showInfo: 			'Show caption / info',
		hideInfo: 			'Hide caption / info',
		showThumbs: 		'Show thumbnails',
		hideThumbs: 		'Hide thumbnails',
		startAutoplay: 		'Start autoplay',
		stopAutoplay: 		'Stop autoplay',
		newItem: 			'NEW',
		clickToOpen: 		'Click to open this document with the associated viewer',
		commentsBtn: 		'Comments',
		commentsLabel: 		'Add a comment, view other\'s comments',
		metaBtn: 			'Photo data', 
		metaLabel: 			'Display photograpic (Exif/Iptc) data', 
		mapBtn: 			'Map',
		mapLabel: 			'Show the photo location on map',
		printBtn: 			'Print',
		printLabel: 		'Print out this photo on your printer',
		shopBtn: 			'Buy',
		shopLabel: 			'Show options to buy this item',
		shareBtn: 			'Share',
		shareLabel: 		'Share this photo over social sites',
		download: 			'Download', 
		original: 			'Original', 
		hiRes: 				'Hi res.',
		saveTip: 			'Use Right click -> Save link as... to download',
		fotomotoBtn: 		'Buy / Share',
		fotomotoLabel: 		'Buy prints or digital files, send free eCard through Fotomoto',
		mostphotosBtn: 		'Purchase',
		mostphotosLabel: 	'Download this image from <b>mostphotos.com</b>!',
		people: 			'People',
		sendFeedback: 		'Send feedback',
		message: 			'Message',
		subject: 			'Subject',
		comment: 			'Comment',
		yourEmail: 			'Your email address',
		send: 				'Send',
		messageSent: 		'Message sent',
		errorSending:		'Error sending email!',
		tooLong: 			'Text is too long or too many items!',
		emailMissing: 		'Email is misssing or wrong!',
		noItemsSelected: 	'No items selected!',
		selectItemsHint: 	'Select the desired items first!',
		nonShoppableItems: 	'The selected items have no or have proprietary shopping options, or different discount rates.',
		buyNItems: 			'Buy {0} items',
		locationWarning: 	'Works only when uploaded',
		cookiePolicyText: 	'This album uses cookies to remember user preferences. By using it, you agree to our use of cookies.',
		cookiePolicyAgree: 	'Got it',
		cookiePolicyLearnMore: 'Learn more'
	};
	
})(jQuery, $(document), $(window), $('body'));
