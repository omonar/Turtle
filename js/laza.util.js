/*
 * laza.util - miscellaneous utility functions and prototype extensions
 *
 */

// Ensuring no 'console is undefined' errors happen

window.console = window.console || (function(){
	return {
		log: function(msg) {}
	};
})();


/*
 *	Extending prototypes
 */
 
String.wsp = [];
String.wsp[0x0009] = true;
String.wsp[0x000a] = true;
String.wsp[0x000b] = true;
String.wsp[0x000c] = true;
String.wsp[0x000d] = true;
String.wsp[0x0020] = true;
String.wsp[0x0085] = true;
String.wsp[0x00a0] = true;
String.wsp[0x1680] = true;
String.wsp[0x180e] = true;
String.wsp[0x2000] = true;
String.wsp[0x2001] = true;
String.wsp[0x2002] = true;
String.wsp[0x2003] = true;
String.wsp[0x2004] = true;
String.wsp[0x2005] = true;
String.wsp[0x2006] = true;
String.wsp[0x2007] = true;
String.wsp[0x2008] = true;
String.wsp[0x2009] = true;
String.wsp[0x200a] = true;
String.wsp[0x200b] = true;
String.wsp[0x2028] = true;
String.wsp[0x2029] = true;
String.wsp[0x202f] = true;
String.wsp[0x205f] = true;
String.wsp[0x3000] = true;

String.prototype.trim = function() { 
	var str = this + '', 
		j = str.length;
	if (j) {
		var ws = String.wsp, 
			i = 0;
		--j;
		while (j >= 0 && ws[str.charCodeAt(j)]) {
			--j;
		}
		++j;
		while (i < j && ws[str.charCodeAt(i)]) { 
			++i; 
		}
		str = str.substring(i, j);
	}
	return str;
};

String.prototype.trunc = function( n ) {
	var t = this + '';
	if (t.length <= n) {
		return t.toString();
	}
	var s = t.substring(0, n - 1), i = s.lastIndexOf(' ');
	return ((i > 6 && (s.length - i) < 20)? s.substring(0, i) : s) + '...';
};

String.prototype.startsWith = function( s ) {
	return (this + '').indexOf( s ) === 0;
};

String.prototype.endsWith = function( s ) {
	return (this + '').substring(this.length - s.length) === s;
};

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.unCamelCase = function() {
	return this.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
String.prototype.getExt = function() {
	var t = this + '', 
		i = t.lastIndexOf('.');
	return (i <= 0 || i >= t.length - 1)? '' : t.substring(i + 1).toLowerCase();
};

String.prototype.hasExt = function(x) {
	var t = (this + ''), 
		i = t.lastIndexOf('.');
	if (i >= 0) {
		t = t.substring(i + 1).toLowerCase();
		return (x + ',').indexOf(t + ',') >= 0;
	}
	return !1;
};

String.prototype.replaceExt = function( s ) {
	var t = this + '', 
		i = t.lastIndexOf('.');
	return (i <= 0)? t : (t.substring(0, i + 1) + s);  
};

String.prototype.fixExtension = function() {
	return (this + '').replace(/.gif$/gi, '.png').replace(/.tif+$/gi, '.jpg');
};

String.prototype.getDir = function() {
	var u = (this + '').split('#')[0];
	return u.substring(0, u.lastIndexOf('/') + 1);
};

String.prototype.getFile = function() {
	var u = (this + '').split('#')[0];
	return u.substring(u.lastIndexOf('/') + 1);
};

String.prototype.getRelpath = function(level) {
	var t = (this + ''), 
		i = t.lastIndexOf('#');
	if (i === -1) {
		i = t.length - 1;
	} else {
		i--;
	}
	for (; i >= 0; i--) {
		if (t[i] === '/' && (level--) === 0)
			break;
	}
	return t.substring(i + 1);
};

String.prototype.fixUrl = function() {
	var i, 
		j, 
		t = this + '';
	while ((i = t.indexOf('../')) > 0) {
		if (i === 1 || (j = t.lastIndexOf('/', i - 2)) === -1) {
			return t.substring(i + 3);
		}
		t = t.substring(0, j) + t.substring(i + 2);
	}
	return t;
};

String.prototype.fullUrl = function() {
	var t = this + '';
	if (!t.match(/^(http|ftp|file)/)) {
		t = window.location.href.getDir() + t;
	}
	return t.fixUrl();
};

String.prototype.cleanupHTML = function() {
	var htmlregex = [
		[ /<br>/gi, '\n' ],
		[ /\&amp;/gi, '&' ],
		[ /\&lt;/gi, '<' ],
		[ /\&gt;/gi, '>' ],
		[ /\&(m|n)dash;/gi , '-' ],
		[ /\&apos;/gi, '\'' ],
		[ /\&quot;/gi, '"' ]
	];
	var t = this + '';
	for (var i = htmlregex.length - 1; i >= 0; i--) {
		t = t.replace( htmlregex[i][0], htmlregex[i][1] );
	}
	return t; 
};

String.prototype.stripHTML = function(format) { 
	var s = (this + '');
	
	if (format) {
		s = s.cleanupHTML();
	}
	
	return s.replace(/<\/?[^>]+>/gi, ''); 
};

String.prototype.stripQuote = function() {
	return (this + '').replace(/\"/gi, '&quot;');
};

String.prototype.appendSep = function(s, sep) {
	return (this.length? (this + (sep || ' &middot; ')) : '') + s; 
};

String.prototype.rgb2hex = function() {
	var t = this + '';
	if (t.charAt(0) === '#' || t === 'transparent') {
		return t;
	}
	var n, r = t.match(/\d+/g), h = '';
	if ( r ) {
		for (var i = 0; i < r.length && i < 3; ++i) {
			n = parseInt( r[i], 10 ).toString(16);
			h += ((n.length < 2)? '0' : '') + n;
		}
		return '#' + h;
	}
	return 'transparent';
};

String.prototype.template = function( s ) {
	if (typeof s === 'undefined' || !this) {
		return this;
	}
	if (!isNaN(parseFloat(s)) && isFinite(s)) {
		s = s + '';
	}
	var t = this + '';
	if (s.constructor === Array) {
		for (var i = 0; i < s.length; ++i) {
			t = t.replace( new RegExp('\\{' + i + '\\}', 'gi'), s[i] );
		}
	} else {
		t = t.replace( /\{0\}/gi, s );
	}
	return t;
};

String.prototype.getSearchTerms = function() {
	var t = this + '';
	
	if (t.indexOf('"') === -1) {
		return t.split(' ');
	} else {
		var a = [],
			i;
	
		do {
			if ((i = t.indexOf('"')) > 0) {
				a.push.apply(a, t.substring(0, i).split(' '));
			}
			t = t.substring(i + 1);
			i = t.indexOf('"');
			if (i < 0) {
				a.push(t);
				break;
			}
			a.push(t.substring(0, i));
			t = t.substring(i + 1);
			
		} while (t.length);
	
		return a;
	}
};

String.prototype.objectify = function() {
	if (!this || !this.length) {
		return this;
	}
	var t = this + '';
	if (t.charAt(0) === '?' || t.charAt(0) === '#') {
		t = t.substring(1);
	}
	var r = {}, o, os = t.split('&');
	for (var i = 0, l = os.length; i < l; ++i) {
		o = os[i].split('=');
		if (o.length > 1) {
			r[o[0]] = decodeURIComponent(o[1]);
		}
	}
	return r;
};

// Test if 's' is in the string
String.prototype.testIn = function(s) {
	if (typeof s !== 'string') {
		s = s + '';
	}
	return (new RegExp(this, 'i')).test(s);
};

// Testing exact match
String.prototype.testExactMatch = function(s) {
	if (s.constructor !== Array) {
		return this == s + '';
	} else {
		for (var i = 0, l = s.length; i < l; ++i) {
			if (this == s[i]) {
				return true;
			}
		}
	}
	return false;
};

// Ignore case but exact match
String.prototype.testMatch = function(s) {
	var t = this.toLowerCase(); 
	if (s.constructor !== Array) {
		return t == (s + '').toLowerCase();
	} else {
		for (var i = 0, l = s.length; i < l; ++i) {
			if (t == s[i].toLowerCase()) {
				return true;
			}
		}
	}
	return false;
};

// Creating hash code
String.prototype.hashCode = function(){
	for (var h = 0, i = 0, l = this.length; i < l; ++i) {
		h = (h << 5) - h + this.charCodeAt(i);
		h &= h;
	}
	return h;
}

// > Min && < Max
Math.minMax = function(a, b, c) {
	b = (isNaN(b))? parseFloat(b) : b;
	return  (b < a)? a : ((b > c)? c : b); 
};

/*
 *	New functions and variables for the global context - no jQuery dependency
 */

var isEmpty = function(o) {
		if (o == null) {
			return true;
		};
		return (Object.getOwnPropertyNames(o)).length === 0;
	},
	
	// Parametrize
	
	paramize = function(o) {
		if (typeof o === 'number') {
			return '' + o;
		} else if (typeof o === 'string') {
			return o;
		} else if (typeof o === 'object') {
			// 1 level depth only
			var s = '',
				op = Object.getOwnPropertyNames(o),
				ol = op.length; 
			for (var i = 0; i < ol; i++) {
				if (o[op[i]] !== null) {
					s += '&' + op[i] + '=' + encodeURIComponent(o[op[i]]);
				}
			}
			if (s.length) {
				return s.substring(1);
			}
		}
		return '';
	},
	
	// All elements are true in an array
	
	allTrue = function(o) {
		if (o && o.constructor === Array) {
			for (var i = 0; i < o.length; ++i) {
				if (!o[i]) {
					return false;
				}
			}
			return true;
		}
		return o === true;
	},

	// Get event coordinates
	
	getCoords = function(e) {
		var x, y;
		
		if (!e.touches) {
			// No touch
			return { 
				x: e.clientX, 
				y: e.clientY 
			};
		} else if (e.touches.length == 1) {
			return {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			}
		} else if (e.changedTouches && e.changedTouches.length == 1) {
			return {
				x: e.changedTouches[0].clientX,
				y: e.changedTouches[0].clientY
			}
		}
		return null;
	},
		
	/*
	 *	Translate function
	 *	returns a translated key, or the default value (if exists), or the key itself de-camelcased
	 */
	
	translate = function(key, def) {
		
		key = key.trim();
		
		if (typeof Texts !== 'undefined') {
			if (Texts.hasOwnProperty(key)) {
				return Texts[key];
			}
		}
		
		if (typeof def !== 'undefined') {
			// Using the default
			if (DEBUG && console) {
				console.log('Using default translation: '+key+'='+def);
			}
			return def;
		}
		
		if (DEBUG && console) {
			console.log('Missing translation: '+key);
		}
		
		var s = key.replace(/([A-Z])/g, ' $1').toLowerCase();
		
		s[0] = s.charAt(0).toUpperCase();
		return s;
	},
	
	/* 
	 *	Simpler method 
	 *	text = getKeys('key1,key2,key3', [defaults])
	 */
	
	getKeys = function(keys, def) {
		
		var t = {}, i, k = keys.split(','), l = k.length;
		
		for (i = 0; i < l; i++) {
			t[k[i]] = translate(k[i], def[k]);
		}
		
		return t;
	},
	
	/*
	 *	Finds translation for each key in def Object
	 *	def should contain only elements that need translation
	 */
	
	getTranslations = function(def) {
		
		var t = {}, k;
		
		for (k in def) {
			if (typeof def[k] === 'object') {
				t[k] = getTranslations(def[k]);
			} else {
				t[k] = translate(k, def[k]);
			}
		}
		
		return t;
	},
	
	// Reading keys: k="name1,name2,... from attr="data-k" into m
	
	readData = function(el, k) {
		var o = {};
		if (el && el.length && k) {
			k = k.split(',');
			var v;
			for (var i = 0; i < k.length; i++) {
				if ((v = el.data(k[i])) != null) {
					o[k[i]] = v;
				}
			}
		}
		return o;
	},
	
	/*
	 *  Relative date
	 */
	
	getRelativeDate = function(days) {
		
		if (!days)
			return translate('today');
		
		if (days===1)
			return translate('yesterday');
			
		var s, n;
		
		if (days >= 730) {
			s = translate('yearsAgo');
			n = Math.round(days / 365);
		} else if (days >= 60) {
			s = translate('monthsAgo');
			n = Math.round(days / 30.5);
		} else {
			s = translate('daysAgo');
			n = days;
		}
		
		return s.replace('{0}', n);
	},
	
	/*
	 *  Timespan
	 */
	
	getTimespan = function(days) {
		
		if (!days)
			return translate('today');
		
		if (days===1)
			return translate('yesterday');
			
		var s, n;
		
		if (days >= 730) {
			s = translate('inThePastNYears');
			n = Math.round(days / 365);
		} else if (days >= 60) {
			s = translate('inThePastNMonths');
			n = Math.round(days / 30.42);
		} else {
			s = translate('inThePastNDays');
			n = days;
		}
		
		return s.replace('{0}', n);
	},

	
	/*
	 *	Relative path
	 */
	 
	getRelativePath = function(from, to) {
		
		if (!to.length) {
			return '';
		}
		
		if (!from.length) {
			if (to.endsWith('/')) {
				return to;
			}
			return to + '/';
		}
		
		if (from === to) {
			return '';
		}

		var fa = from.split('/'),
			ta = to.split('/');
		
		while (fa.length && ta.length && fa[0] === ta[0]) {
			fa.shift();
			ta.shift();
		}
		
		return '../../../../../../../../../../../../../../../../../../../../'.substring(0, (fa.length - 1) * 3) + (ta.length? (ta.join('/') + '/') : '');
	},

	
	/* 
	 *	Pure JS extend function
	 */
	
	extend = function() {
		for (var i = 1; i < arguments.length; i++)
			for (var key in arguments[i])
				if (arguments[i].hasOwnProperty(key))
					arguments[0][key] = arguments[i][key];
		return arguments[0];
	},
	
	/*
	 *	Passing defaults to libraries
	 */
	 
	passDefaults = function(src, dst, props) {
		if (typeof props !== 'undefined' && src && dst) {
			props = props.split(',');
			
			for (var i = 0; i < props.length; i++) {
				if (src.hasOwnProperty(props[i])) {
					dst[props[i]] = src[props[i]];
				}
			}
		}
	},
	
	/*
	 *	Reading user preferences from cookies
	 */
	 
	readUserPrefs = function(dst, props) {
		if (typeof props !== 'undefined' && dst) {
			props = props.split(',');
			
			var p;
			
			for (var i = 0; i < props.length; i++) {
				if ((p = $.cookie(props[i])) !== null) {
					dst[props[i]] = p;
				}
			}
		}
	 },
	
	/*
	 *	History management
	 */
	 
	 // Adds one new state component
	 
	 addParam = function(indexName, params, title) {
	
		if (HISTORY) {
			var hash = window.location.hash;
			
			if (hash) {
				// Already has hash
				if (hash.charAt(0) === '#') {
					hash = hash.substring(1);
				}
				params = extend(history.state || hash.objectify(), params);
			}
			
			hash = '#' + paramize(params);
			
			if (hash !== window.location.hash) {
				history.pushState(params, (typeof title === 'undefined')? '' : title, (hash.length > 1)? hash : (indexName || 'index.html'));
			}
		}
	},
	
	// Sets a new state
	
	setParam = function(indexName, params, title) {
	
		if (HISTORY) {
			var hash = '#' + paramize(params);
			
			if (hash !== window.location.hash) {
				history.pushState(params, (typeof title === 'undefined')? '' : title, (hash.length > 1)? hash : (indexName || 'index.html'));
			}
		}
	},

	// Removes one parameter (String)
	
	removeParam = function(indexName, param, title) {
		
		if (HISTORY) {
			var hash = window.location.hash,
				params;
			
			if (hash) {
				if (typeof param === 'undefined') {
					hash = '';
					history.pushState('', '', indexName || 'index.html');
				} else {
					if (hash.charAt(0) === '#') {
						hash = hash.substring(1);
					}
					params = history.state || hash.objectify();
					if (params.hasOwnProperty(param)) {
						delete params[param];
						hash = '#' + paramize(params);
					}
					history.pushState(params, (typeof title === 'undefined')? '' : title, (hash.length > 1)? hash : (indexName || 'index.html'));
				}
			}
		}
	},
	
	// Removing ?search
	
	removeSearch = function(title) {
		
		if (HISTORY) {
			history.replaceState(history.state, (typeof title === 'undefined')? '' : title, window.location.href.replace(window.location.search, ''));
		}
	},
	
	// Reading state object
	
	readParam = function() {
		
		if (HISTORY) {
			if (history.state) {
				return history.state;
			}
			
			var hash = window.location.hash;
			if (hash.charAt(0) === '#') {
				hash = hash.substring(1);
			}
			return  hash.objectify();
		}
		
		return null;
	},
	
	// Printing an image with caption
	
	printImage = function(src, title, caption) {
		
		if (!src) {
			return;
		}
		
		var pw = window.open('about:blank', 'print', 'location=no,status=no,titlebar=no');
		
		pw.document.open();
		pw.document.write('<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>' + (title || 'Print') + '</title>' +
			'\n<script>printOut=function(){window.print();window.close();}</scr' + 'ipt>' + 
			'\n<style>body{margin:0;padding:0;text-align:center;overflow:hidden;}\nimg{display:block;width:100%;height:auto;vertical-align:top;}</style>' +
			'\n</head>\n<body onLoad="setTimeout(printOut,100)">' +
			'<img src="' + src + '">' + (caption || '') + 
			'</body>\n</html>');
		pw.document.close();
	},
	
	// Simple decryption

	xDecrypt = function(c) {
		
		if (!typeof this === 'String') {
			return '';
		}
		var xs = [0x93,0xA3,0x57,0xFE,0x99,0x04,0xC6,0x17];
		var cl = c.length,
			sl = Math.ceil(cl / 8) * 5;
		var src = new Array(sl), r = '', i, j = 0, k, v;
		for (i = 0; i < sl; i++) {
			src[i] = 0;
		}
		for (i = 0; i < cl; i++) {
			if ((v = c.charCodeAt(i) - 0x30) > 9) {
				v -= 7;
			}
			v <<= 11 - j % 8;
			k = Math.floor(j / 8);
			if (k < sl) {
				src[k] |= v >> 8;
				if (++k < sl)
					src[k] |= v & 0xff;
			}
			j += 5;
		}
		for (i = 0; i < sl; i++) {
			src[i] ^= xs[i % 8];
		}
		sl = src[0] | (src[1] << 8);
		for (v = 0, i = 4; i < sl; i++) {
			r += String.fromCharCode(src[i]);
			v += src[i];
		}
		if (v != ((src[2] & 0xff) | (src[3] << 8)))
			r = '';
		return r;
	},
		
	// Testing scrollbar width for mobile detection
	
	scrollbarWidth = function() {
		var div = document.createElement("div");
		div.style.cssText = 'width:100px;height:100px;overflow:scroll !important;position:absolute;top:-9999px';
		document.body.appendChild(div);
		var result = div.offsetWidth - div.clientWidth;
		document.body.removeChild(div);
		return result;
	},
		
	// Test for touch support
	
	isTouchEnabled = function() {
		if (/Trident/.test(navigator.userAgent)) {
			return (typeof navigator['maxTouchPoints'] !== 'undefined' && navigator.maxTouchPoints); // || /IEMobile/.test(navigator.userAgent);
		} else if (/Edge/.test(navigator.userAgent)) {
			return (scrollbarWidth() == 0);
		} else if (/(Chrome|CriOS)/.test(navigator.userAgent)) {
			return /Mobile/.test(navigator.userAgent) || 'ontouchstart' in window; 
		}
		return 'ontouchstart' in window;
	},
	
	getTouch = function() {
	
		if (/Trident|Edge/.test(navigator.userAgent)) {
			// Setting MS events
			if (window.navigator.pointerEnabled) {
				return {
					'START': 	'pointerdown',
					'MOVE':		'pointermove',
					'END':		'pointerup',
					'CANCEL':	'pointercancel'
				};
			}
			return {
				'START': 	'MSPointerDown',
				'MOVE':		'MSPointerMove',
				'END':		'MSPointerUp',
				'CANCEL':	'MSPointerCancel'
			};
		}
	
		return {
			'START': 	'touchstart',
			'MOVE':		'touchmove',
			'END':		'touchend',
			'CANCEL':	'touchcancel'
		};
	},
	
	// Test for localStorage
	
	hasLocalStorage = function() {
		try {
			localStorage.setItem('_t', 'undefined');
            localStorage.removeItem('_t');
			return true;
		} catch(e) {
			return false;
		}
	},
	
	// Test for history
	
	hasHistory = function() {
		// Taken from Modernizr 3.1
		var ua = navigator.userAgent;

		if ((ua.indexOf('Android 2.') !== -1 ||
			(ua.indexOf('Android 4.0') !== -1)) &&
			ua.indexOf('Mobile Safari') !== -1 &&
			ua.indexOf('Chrome') === -1 &&
			ua.indexOf('Windows Phone') === -1) {
		  return false;
		}

		return (window.history && 'pushState' in window.history);
	},
	
	// Adding class without jQuery (can be used anytime)
	
	addClass = function(el, className) {
		if (el.classList)
			el.classList.add(className);
		else
			el.className += ' ' + className;
	},

	// Returns browser vendor
	
	getVendor = function() {
		var ua = navigator.userAgent;
		/*
			PC:
				IE 8: "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)"
				IE 9: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; .NET CLR 2.0.50727; SLCC2; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; Tablet PC 2.0; .NET4.0C)"
				IE 10: "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; .NET4.0E; .NET4.0C)"
				Opera 12: "Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.15"
				Firefox 21: "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"
				Chrome 27: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.94 Safari/537.36"
			Mac:
				Chrome 27: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36"
				Firefox 21: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:21.0) Gecko/20100101 Firefox/21.0"
				Safari 6: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.14 (KHTML, like Gecko) Version/6.0.1 Safari/536.26.14"
		 */
		if (ua.indexOf('Trident') > 0) {
			return 'ms';
		} else if (ua.indexOf('AppleWebKit') > 0) {
			return 'webkit';
		} else if (ua.indexOf('Gecko') > 0) {
			return 'moz';
		} else if (ua.indexOf('Presto') > 0) {
			return 'o';
		} else if (ua.indexOf('Blink') > 0) {
			return 'webkit';
		}
		return '';		
	},
	
	/*
	 *	New constants
	 */

	UNDEF 			= 'undefined',
	NOLINK 			= 'javascript:void(0)',
	LOCAL 			= location.protocol.indexOf('file:') === 0,
	LOCALSTORAGE 	= hasLocalStorage(),
	HISTORY			= hasHistory(),
	VEND 			= getVendor(),
	TOUCH			= getTouch(),
	TOUCHENABLED	= isTouchEnabled();
	
	// Adding 'touch' : 'no-touch' classes
	addClass(document.getElementsByTagName('html')[0], (TOUCHENABLED? '' : 'no-') + 'touch');
	
	
/*	
 *	Debugging functions
 */

var log = function() {},
	DEBUG = (typeof DEBUG === 'undefined')? false : DEBUG;

// Waiting for jQuery loaded

(function($, undefined) {
		
	// log: logging function
	
	var _logel, 
		_logover = false, 
		_lastlog, 
		_lastcnt = 1;
	
	log = function(c) {
		
		var resolveObject = function(c) {
			if ($.isArray(c)) {
				var s = '';
				for (var i = 0; i < c.length; i++) {
					s += resolveObject(c[i]) + ', ';
				}
				return '[ ' + s.substring(0, s.length-2) + ' ]';
			} else if (typeof c === 'object') {
				var s = '';
				for (var i in c) {
					s += i + ': ' + resolveObject(c[i]) + ',<br>';
				}
				return '{ ' + s + ' }';
			} else if (isNaN(c)) {
				return c;
			} else {
				return (parseInt(c) === c)? c : c.toFixed(4);
			}
		};
					
		if (!DEBUG || _logover) {
			return;
		}
		if (!_logel) {
			_logel = $('<div id="log" style="position:fixed;left:0;top:0;width:200px;bottom:0;overflow:auto;padding:10px;background-color:rgba(0,0,0,0.5);color:#fff;font-size:0.75em;z-index:999999"></div>').hover(function(){
				_logover = true;
			}, function() {
				_logover = false;
			}).appendTo('body');
		}
		if (c === _lastlog) {
			_logel.children(':first').empty().html(_lastlog + ' <sup>(' + (++_lastcnt) + ')</sup>');
		} else {
			$('<div style="height:3em;overflow:auto;">' + resolveObject(c) + '</div>').prependTo(_logel);
			_lastlog = c;
			_lastcnt = 1;
		}
	};
	
	// logEvents :: debugging events
	
	$.fn.logEvents = function( e ) {
		if (!DEBUG) {
			return;
		}
		
		var events = e || 'mousedown mouseup mouseover mouseout mousewheel wheel dragstart click blur focus load unload reset submit change abort cut copy paste selection drag drop orientationchange touchstart touchmove touchend touchcancel pointerdown pointermove pointerup MSPointerDown MSPointerMove MSPointerUp gesturestart gesturechange gestureend';

		return this.each(function() {
			$(this).on(events, function(e) {
				if (typeof e === 'undefined') {
					log('Undefined event');
				} else if (e.target) {
					if (e.target.id !== 'log') { 
						log(e.type + ' <span style="padding:0 4px;font-size:0.75em;background-color:#000;border-radius:4px;"><b>' + (e.target.nodeName? e.target.nodeName.toLowerCase() : '???') + '</b>' + (e.target.id? (':'+e.target.id) : '') + '</span>' + 
							(e.relatedTarget? (' <span style="padding:0 4px;font-size:0.6em;background-color:#800;border-radius:4px;"><b>' + e.relatedTarget.nodeName.toLowerCase() + '</b>' + (e.relatedTarget.id? (':'+e.relatedTarget.id) : '') + '</span>') : ''));
					}
				} else {
					log('No event target!');
				}
				return true;
			});
		});
	};
	
	// logCss :: tracks css values until the element is live
	
	$.fn.logCss = function( p, dur, step ) {
		if (!DEBUG) {
			return;
		}
		
		step = step || 20;
		dur = dur || 2000;
		var t0 = new Date();
		
		return this.each(function() {
			var el = $(this);
			var show = function( nm ) {
				var t = new Date() - t0;
				log(t + '&nbsp;::&nbsp;' + nm + ' = ' + el.css(nm));
				if (t > dur) {
					clearInterval(iv);
				}
			};
			
			var iv = setInterval(function() {
				if ( $.isArray(p) ) {
					for (var i = 0; i < p.length; i++) {
						show(p[i]);
					}
				}
				else {
					show(p);
				}
			}, step);
		});
	};
	
	// Making $.when working with arrays
	
	if ($.when.all === undefined) {
		$.when.all = function(deferreds) {
			var deferred = new $.Deferred();
			$.when.apply($, deferreds).then(
				function() {
					deferred.resolve(Array.prototype.slice.call(arguments));
				},
				function() {
					deferred.fail(Array.prototype.slice.call(arguments));
				}
			);
			return deferred;
		}
	}
	
	
	$.fn.waitAllImg = function(doneFn, successFn, failFn) {
		var self = $(this),
			deferreds = [],
			loadImage = function(image) {
				var deferred = new $.Deferred(),
					img = new Image();
				img.onload = function() {
					deferred.resolve(image);
				};
				img.onerror = function() {
					deferred.reject(new Error('Image not found: ' + image.src));
				};
				img.src = image.src;
				return deferred;
			},
			loadImages = function(imgs) {
				imgs.filter('img[src][src!=""]').each(function() {
					deferreds.push(loadImage(this));
				});
				return $.when.all(deferreds);
			};

		loadImages(self).then(
			function(self) {
				if ($.isFunction(successFn)) {
					successFn.call(self);
				}
			},
			function(err) {
				if ($.isFunction(failFn)) {
					failFn.call(err);
				}
			}
		).then(function() {
			if ($.isFunction(doneFn)) {
				doneFn.call(self);
			}
		});
		return this;
	};
	
})(jQuery);
