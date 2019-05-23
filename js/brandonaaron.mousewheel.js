/*	
 *	mousewheel :: mouse wheel event handling
 *
 *	Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
 *	modified by Laza
 *
 *	Usage: 
 *		$(element).on('mousewheel', action)
 *		$(element).off('mousewheel', action)
 */

(function($) {
	'use strict';
	
	var mousewheelTypes = ['DOMMouseScroll', 'mousewheel'];

	if ($.event.fixHooks) {
		for ( var i = mousewheelTypes.length; i; ) {
			$.event.fixHooks[ mousewheelTypes[--i] ] = $.event.mouseHooks;
		}
	}
	
	$.event.special.mousewheel = {
		
		setup: function(){
			if ( this.addEventListener ) {
				for ( var i = mousewheelTypes.length; i; ) {
					this.addEventListener( mousewheelTypes[--i], mousewheelHandler, false );
				}
			} else { 
				this.onmousewheel = mousewheelHandler;
			}
		},
		
		teardown: function() {
			if ( this.removeEventListener ) {
				for ( var i = mousewheelTypes.length; i; ) {
					this.removeEventListener( mousewheelTypes[--i], mousewheelHandler, false );
				}
			} else { 
				this.onmousewheel = null;
			}
		}
	};

	$.fn.extend({
			
		mousewheel: function( fn ){
			return fn? this.bind( 'mousewheel', fn ) : this.trigger('mousewheel');
		},
		
		unmousewheel: function( fn ){
			return this.unbind( 'mousewheel', fn );
		}
	});
	
	var mousewheelHandler = function( event ) {
		var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, deltaX = 0, deltaY = 0;
		event = $.event.fix( orgEvent );
		event.type = 'mousewheel';
		
		// old school
		if ( orgEvent.wheelDelta ) { 
			delta = orgEvent.wheelDelta / 120; 
		} else if ( orgEvent.detail ) { 
			delta = -orgEvent.detail / 3; 
		}
		
		// new school (touchpad)
		deltaY = delta;
		
		// Gecko
		if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
			deltaY = 0;
			deltaX = -1 * delta;
		}
		
		// Webkit
		if ( orgEvent.wheelDeltaY !== undefined ) { 
			deltaY = orgEvent.wheelDeltaY / 120; 
		}
		if ( orgEvent.wheelDeltaX !== undefined ) { 
			deltaX = -1 * orgEvent.wheelDeltaX / 120; 
		}
		args.unshift( event, delta, deltaX, deltaY );
		
		return ($.event.dispatch || $.event.handle).apply( this, args );
	};

})(jQuery);
