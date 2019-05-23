/*	
 *	addSocial() :: adds a popup box to the div to share the current page over various sharing sites
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).addSocial( options );
 *
 *	Options:
		id: 			'shares',
		useHash: 		true,
		likeBtnTheme: 	'light',
		callTxt: 		'Found this page',
		pos: 			{ 
							posX: 1,
							posY: 2,
							toX: 1,
							toY: 0
						},
		localWarning: 	'Can\'t share local albums. Please upload your album first!'
 */

;(function($) {
	'use strict';
	
	var tumblr_photo_source = '', 
		tumblr_photo_caption = '',
		tumblr_photo_click_thru = '';
	
	$.fn.addSocial = function(settings) {
		
		settings = $.extend({}, $.fn.addSocial.defaults, settings);
		
		var LOCAL = location.protocol.indexOf('file:') === 0,
			text = getTranslations($.fn.addSocial.text),
			u = window.location.href.split('#')[0] + 
				(settings.useHash? ('#' + encodeURIComponent(settings.hash || '')) : ''),
			ue = encodeURIComponent( window.location.href.split('#')[0] ) + (settings.useHash? ('#' + encodeURIComponent(settings.hash || '')) : ''),
			ti = encodeURIComponent( settings.title || $('meta[name=title]').attr('content') || $('title').text() ),
			tx = encodeURIComponent( text.checkOutThis ),
			bw = settings.inline? 90 : settings.width,
			bh = 22,
			im = settings.image? 
				(window.location.href.getDir() + settings.image) : 
				$('link[rel=image_src]').attr('href');
				
		return this.each(function() {
			var a = $(this);
			
			/*if ( this.nodeName === 'a' ) {
				a.attr('href', NOLINK);
			}*/
			
			var e = $('<div>', { 
				'class': settings.className
			});
			
			if (LOCAL && !DEBUG) {
				e.html(text.localWarning);
			} else {
				if (!LOCAL) {
					// No buttons in local mode
					
					if (!settings.useHash) {
						// separate slides mode
						
						if (settings.facebookLike) {
							e.append('<div class="likebtn"><iframe src="https://www.facebook.com/plugins/like.php?href=' + u + '&amp;layout=button_count&amp;show_faces=false&amp;width=' + bw + '&amp;action=like&amp;font=arial&amp;colorscheme=' + settings.likeBtnTheme + '&amp;height=' + bh + '" scrolling="no" frameborder="0" style="border:none;overflow:hidden;width:' + bw + 'px;height:' + bh + 'px;" allowTransparency="true"></iframe></div>');
						}
					
						if (settings.twitterTweet) {
							e.append('<div class="likebtn"><iframe allowtransparency="true" frameborder="0" scrolling="no" src="//platform.twitter.com/widgets/tweet_button.html?url=' + u + '&text=' + ti + '" style="width:' + bw + 'px; height:' + bh + 'px;"></iframe></div>');
						}
						
						if (settings.googlePlus) {
							var w = (settings.inline? 90 : 120),
							po = $('<div class="likebtn" style="max-width:' + w + 'px;min-width:' + w + 'px;"><div class="g-plusone" data-href="' + u + '"></div></div>').appendTo(e);
							// 20 attempts, 200ms in between
							var la = 20;
							var launch = function() {
								if (typeof gapi === 'undefined') {
									if (la--) {
										setTimeout(launch, 200);
									} else if ('console' in window) {
										console.log('Google Plus API failed to load!');
									}
								} else {
									setTimeout(function() {
										gapi.plusone.render(po[0], {
											'size': 		'medium',
											'annotation': 	'bubble'
										});
									}, 200);
								}
							};
							launch();
						}
						
						if (settings.pinItBtn) {
							e.append('<div class="likebtn" style="height:' + bh + 'px;"><a data-pin-config="beside" href="//pinterest.com/pin/create/button/?url=' + ue + '&media=' + encodeURIComponent(im) + '&description=' + ti + '" data-pin-do="buttonPin" ><img src="https://assets.pinterest.com/images/pidgets/pin_it_button.png" /></a></div>');
						}
					}
					
					if (settings.tumblrBtn) {
						e.append('<div class="likebtn" id="tumblr"><a href="//www.tumblr.com/share/' + (settings.image? 'photo?source=' : 'link?url=') + encodeURIComponent(u) + '&name=' + ti + '" title="Share on Tumblr" style="display:inline-block;text-indent:-9999px;overflow:hidden;width:' + bw + 'px;height:' + bh + 'px;background:url(https://platform.tumblr.com/v1/share_1.png) top left no-repeat transparent;">Tumblr</a></div>');
						tumblr_photo_source = im;
						tumblr_photo_caption = ti;
						tumblr_photo_click_thru = u;
					}
				}
				
				if (settings.facebook || settings.twitter || settings.gplus || settings.pinterest || settings.digg || settings.delicious || 
					settings.myspace || settings.stumbleupon || settings.reddit || settings.email) {
					
					if (!settings.buttonLabels) {
						e.append('<span>' + text.shareOn + '</span>');
					}
					
					if (settings.facebook && !settings.useHash) {
						e.append('<a href="https://www.facebook.com/sharer.php?s=100&p%5Burl%5D=' + ue + '&p%5Bimages%5D%5B0%5D=' + im + '&p%5Btitle%5D=' + ti + '" class="facebook"' + (settings.buttonLabels? '>Facebook':' title="Facebook">') + '</a>');
					}
					if (settings.twitter) {
						e.append('<a href="https://twitter.com/home?status=' + tx + ': ' + ue + '" class="twitter"' + (settings.buttonLabels? '>Twitter':' title="Twitter">') + '</a>');
					}
					if (settings.gplus && !settings.useHash) {
						e.append($('<a>', {
							'class': 	'gplus',
							href: 		'https://plus.google.com/share?url=' + ue,
							title: 		'Google+',
							text: 		settings.buttonLabels? 'Google+':''
						}).on('click', function() {
							window.open(this.href, this.title, 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=760,width=980');
							return false;
						}));
					}
					if (settings.pinterest) {
						e.append('<a href="https://pinterest.com/pin/create/button/?url=' + ue + '&media=' + encodeURIComponent(im) + '&description=' + ti + '" class="pinterest"' + (settings.buttonLabels? '>Pinterest':' title="Pinterest">') + '</a>');
					}
					if (settings.digg) {
						e.append('<a href="https://digg.com/submit?url=' + u + '" class="digg"' + (settings.buttonLabels? '>Digg':' title="Digg">') + '</a>');
					}
					if (settings.delicious) {
						e.append('<a href="https://delicious.com/save?url=' + u + '&title=' + ti + '&v=5" class="delicious"' + (settings.buttonLabels? '>Delicious':' title="Delicious"') + '</a>');
					}
					if (settings.myspace) {
						e.append('<a href="https://www.myspace.com/index.cfm?fuseaction=postto&t=' + ti + '&u=' + u + '&l=3" class="myspace"' + (settings.buttonLabels? '>MySpace':' title="MySpace"') + '</a>');
					}
					if (settings.stumbleupon) {
						e.append('<a href="https://www.stumbleupon.com/submit?url=' + u + '&title=' + ti + '" class="stumbleupon"' + (settings.buttonLabels? '>StumbleUpon':' title="StumbleUpon">') + '</a>');
					}
					if (settings.reddit) {
						e.append('<a href="https://www.reddit.com/submit?url=' + u + '" class="reddit"' + (settings.buttonLabels? '>Reddit':' title="Reddit"') + '</a>');
					}
					e.children('a').attr('target', '_blank');
					
					if (settings.email) {
						e.append('<a href="mailto:?subject=' + tx + '&body=' + ti + '%0D%0A' + u.replace(/%/g, '%25') + '" class="email"' + (settings.buttonLabels? '>Email':' title="Email">') + '</a>');
					}
					if (!settings.buttonLabels) {
						e.children('a').addTooltip();
					}
				}
				
			}
			
			a.on('destroy', function() {
				e.remove();
			});
			
			if (e.not(':empty')) {
				if (settings.inline) {
					e.appendTo(a);
				} else {
					a.addTooltip(e, {
						width: 			settings.width,
						touchToggle:	true,
						stay: 			5000,
						pos: 			settings.pos
					});
				}
			}
		});
	};
	
	$.fn.addSocial.defaults = {
		className: 		'shares',
		width: 			120,
		useHash: 		true,
		likeBtnTheme: 	'light',
		inline: 		false,
		buttonLabels: 	true,
		/*
		facebookLike: !1,
		twitterTweet: !1,
		googlePlus: !1,
		tumblrBtn: !1,
		facebook: !1,
		twitter: !1,
		gplus: !1,
		digg: !1,
		delicious: !1,
		myspace: !1,
		stumbleupon: !1,
		reddit: !1,
		email: !1,
		*/
		pos: 			[1,2,1,0]
	};
	
	$.fn.addSocial.text = {
		shareOn: 		'Share on',
		checkOutThis: 	'Found this page',
		localWarning: 	'Can\'t share local albums. Please upload your album first!'
	};

})(jQuery);
