/*	
 *	cookie() :: Cookie handling - using localStorage if exists
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
 *		cookie( key ) :: returns cookie or null
 *		cookie( key, null ) :: deletes cookie
 *		cookie( key, value, [expire]) :: saves cookie, expire in # seconds - default expiry is 1 hour
 */
 
;(function($) {
	'use strict';
				
	var LOCALSTORAGE = (function(){
			try {
				localStorage.setItem('_t', VER);
				localStorage.removeItem('_t');
				return true;
			} catch(e) {
				return false;
			}
		}());
	
	$.cookie = function(key, value, expire) { 
		//log('c('+key+(value? (','+value):'')+(expire? (','+expire):'')+')');
		var c, 
			d,
			cookie_sep = "; ",
			
			cookie_val = function(v) {
				return (/^(true|yes)$/).test(v)? true : 
					((/^(false|no)$/).test(v)? false : ((/^([\d.]+)$/).test(v)? parseFloat(v) : v));
			};
		
		if (arguments.length > 1) { 
			// write
			d = new Date();
			
			if (value === null) {
				// remove
				if (LOCALSTORAGE) {
					localStorage.removeItem(key);
				} else {
					document.cookie = encodeURIComponent(key) + "=" + '; expires=' + d.toGMTString() + "; path=/";
				}
			} else if (/^(string|number|boolean)$/.test(typeof value)) {
				// store
				d.setTime(d.getTime() + (((typeof expire !== 'number')? 3600 : expire) * 1000));
				if ( LOCALSTORAGE ) {
					localStorage.setItem(key, String(value) + cookie_sep + String(d.getTime()));
				} else {
					document.cookie = encodeURIComponent(key) + "=" + String(value) + '; expires=' + d.toGMTString() + "; path=/";
				}
			}
			return value;
		
		} else if (key) { 
			// read
			if (LOCALSTORAGE) {
				c = localStorage.getItem(key);
				if (c) {
					c = c.split(cookie_sep);
					if ($.isArray(c) && c.length > 1) {
						d = new Date();
						if (d.getTime() < parseInt(c[1], 10)) {
							// not yet expired 
							return cookie_val(c[0]);
						} else {
							// remove expired cookie
							localStorage.removeItem( key );
						}
					} else {
						// no expiration was set
						return cookie_val( c );
					}
				}
			} else {
				var v;
				c = document.cookie.split(';');					
				key += '=';
				for (var i = 0; i < c.length; i++) {
					v = c[i].trim();
					if (v.indexOf(key) === 0) {
						v = v.substring( key.length );
						cookie_val(v);
					}
				}
			}
		}
		
		return null;
	};
	
})(jQuery);
