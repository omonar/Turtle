/*	
 *	dbltap :: double tap handling on touch devices
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: 
 *		$(element).on('dbltap', action)
 *		$(element).off('dbltap', action)
 */

(function($) {
	'use strict';

	$.event.special.dbltap = {
		
		setup: function() {
			$(this).on('touchend.dbltap', $.event.special.dbltap.handler);
		},
	
		teardown: function() {
			$(this).off('touchend.dbltap');
		},
	
		handler: function( e ) {
			var args = [].slice.call( arguments, 1 ),
				t = $(e.target),
				now = new Date().getTime(),
				d = now - (t.data('lastTouch') || 0);

			if ( d > 5 && d < 300 ) {
				e.preventDefault();
				t.data('lastTouch', 0);
				e = $.event.fix( e || window.event );
				e.type = 'dbltap';
				args.unshift( e );
				return ($.event.dispatch || $.event.handle).apply( this, args );
			} else {
				t.data('lastTouch', now);
				return true;
			}
		}
	};
	
})(jQuery);
