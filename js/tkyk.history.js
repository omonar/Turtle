/*	
 *	history plugin
 *
 *	Licensed under MIT License / Copyright (c) 2006-2009 Taku Sano (Mikage Sawatari) / Copyright (c) 2010 Takayuki Miwa
 *	http://tkyk.github.com/jquery-history-plugin/
 */
 
(function($) {
			
	(function(){
		
		var needDecode = !(navigator.userAgent.indexOf('Firefox') >= 0 && parseInt(navigator.userAgent.match(/Firefox\/(\d*(\.\d*)*)/)[1]) < 41);
		
		var locationWrapper = {
			put: function(hash, win) {
				(win || window).location.hash = this.encoder(hash);
			},
			get: function(win) {
				var hash = ((win || window).location.hash).replace(/^#/, '');
				try {
					return needDecode? decodeURIComponent(hash) : hash;
				}
				catch (error) {
					return hash;
				}
			},
			encoder: encodeURIComponent
		};

		function initObjects(options) {
			options = $.extend({
					unescape: false
				}, options || {});
	
			locationWrapper.encoder = encoder(options.unescape);
	
			function encoder(unescape_) {
				if(unescape_ === true) {
					return function(hash){ return hash; };
				}
				if(typeof unescape_ === "string" &&
					(unescape_ = partialDecoder(unescape_.split(""))) || 
					typeof unescape_ === "function") {
					return function(hash) { return unescape_(encodeURIComponent(hash)); };
				}
				return encodeURIComponent;
			}
	
			function partialDecoder(chars) {
				var re = new RegExp($.map(chars, encodeURIComponent).join("|"), "ig");
				return function(enc) { return enc.replace(re, decodeURIComponent); };
			}
		}
	
		var implementations = {};
	
		implementations.base = {
			callback: undefined,
			type: undefined,
			check: function() {},
			load:  function() {}, // function(hash) ?
			init:  function(callback, options) {
				initObjects(options);
				self.callback = callback;
				self._options = options;
				self._init();
			},
	
			_init: function() {},
			_options: {}
		};
	
		implementations.timer = {
			_appState: undefined,
			_init: function() {
				var current_hash = locationWrapper.get();
				self._appState = current_hash;
				self.callback(current_hash);
				setInterval(self.check, 100);
			},
			check: function() {
				var current_hash = locationWrapper.get();
				if(current_hash !== self._appState) {
					self._appState = current_hash;
					self.callback(current_hash);
				}
			},
			load: function(hash) {
				if(hash !== self._appState) {
					locationWrapper.put(hash);
					self._appState = hash;
					self.callback(hash);
				}
			}
		};

		implementations.hashchangeEvent = {
			_init: function() {
				//console.log('history.init()');
				self.callback(locationWrapper.get());
				$(window).on('hashchange', self.check);
			},
			check: function() {
				//console.log('history.check()');
				self.callback(locationWrapper.get());
			},
			load: function(hash) {
				//console.log('history.load('+hash+')');
				locationWrapper.put(hash);
			}
		};
	
		var self = $.extend({}, implementations.base);
	
		if ('onhashchange' in window) {
			self.type = 'hashchangeEvent';
		} else {
			self.type = 'timer';
		}
	
		$.extend(self, implementations[self.type]);
		$.history = self;
	})();
	
})(jQuery);
