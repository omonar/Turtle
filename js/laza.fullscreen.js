/*	
 *	fullScreen() :: makes an element full-screen or cancels full screen
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).fullScreen( [true | false] );
 *
 */

(function($) {
	'use strict';
	
	var isFullscreen = function() {
			return document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullScreenElement ||
				document.msFullscreenElement;
		},
	
		requestFullscreen = function( e ) {
			if (!isFullscreen()) {
				if (e.requestFullscreen) {
					e.requestFullscreen();
				} else if (e.webkitRequestFullscreen) {
					e.webkitRequestFullscreen();
				} else if (e.mozRequestFullScreen) {
					e.mozRequestFullScreen();
				} else if (e.msRequestFullscreen) {
					document.body.msRequestFullscreen();
					// Works only on body :(
					// e.msRequestFullscreen();
				}
			}
		},
		
		exitFullscreen = function() {
			if (isFullscreen()) {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				}
			}
		};
	
	$.fn.fullScreen = function(v) {
		
		if (document.fullscreenEnabled || 
			document.webkitFullscreenEnabled || 
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
		) {
			// no state supplied :: returning the fullscreen status
			if (typeof v === 'undefined') {
				return isFullscreen();
			} else if (v) {
				requestFullscreen(this[0]);
			} else {
				exitFullscreen();
			}
			
		} else {
			return false;
		}
		
	};

})(jQuery);
