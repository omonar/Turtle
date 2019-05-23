/*	
 *	addMap() :: preprocessing Google Maps map
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).addMap( options )
 *
 *	Options:
		type: 'roadmap',		// 'roadmap', 'Satellite', 'Hybrid', 'Terrain'
		zoom: 16,				// 0 .. 20
		range: 30,				// restricting the number of markers :: 30 means display markers from curr - 30 to curr + 30
		resPath:				// path to marker graphics
		markers:				// array of markers to display
		curr:					// current marker (center map here)
		click:					// function to be called upon marker click
 */

;(function($) {
	'use strict';
		
	// getLatLng :: returns google.maps position from formatted string "lat,lon" or Array(lat, lon)
	
	$.getLatLng = function( p ) { 
		if ( typeof google === 'undefined' || p == null ) {
			return null;
		}
		if ( typeof p === 'string' ) {
			p = p.split(',');
			return new google.maps.LatLng(parseFloat(p[0]) || 0.0, parseFloat(p[p.length-1]) || 0.0);
		}
		return new google.maps.LatLng(p[0], p[1]);
	};


	$.fn.addMap = function( settings ) {
		
		if ( typeof google === 'undefined' || !google.maps ) { 
			return this;
		}
		
		settings = $.extend( {}, $.fn.addMap.defaults, settings );
		
		var markerCurr = settings.resPath + '/marker-curr.png',
			markerEtc = settings.resPath + '/marker.png',
			miCurr = new google.maps.MarkerImage(markerCurr, new google.maps.Size(17,24), new google.maps.Point(0,0), new google.maps.Point(8,24)),
			miEtc = new google.maps.MarkerImage(markerEtc, new google.maps.Size(17,24), new google.maps.Point(0,0), new google.maps.Point(8,24)),
			miShadow = new google.maps.MarkerImage(settings.resPath + '/marker-shadow.png', new google.maps.Size(24,24), new google.maps.Point(0,0), new google.maps.Point(8,24)); 
		
		return this.each(function() {
			var t = $(this), ll, label, map, tmp, to, c, 
				markers = [], first, curr;
			
			t.readData( settings, "type,zoom,map,label,resPath,markers" );
			
			var adjust = function() {
				if ( t && t.data('fresh') ) {
					if ( map && t.is(':visible') && !t.parents(':hidden').length && t.width() && t.height() ) {
						clearTimeout(to);
						t.width(t.parent().width());
						google.maps.event.trigger( map, 'resize' );
						map.setCenter( ll );
						t.data('fresh', false);
					} else {
						to = setTimeout(adjust, 200);
					}
				}
			};
			
			if ( tmp && tmp.length ) {
				tmp.remove();
			}
			
			tmp = $('<div>').css({ 
				position: 'absolute', 
				top: '-9000px', 
				width: t.width(), 
				height: t.height() 
			}).appendTo('body');
			
			t.data('fresh', true).on({
				adjust: adjust,
				destroy: function() {
					// No remove function with Google Maps?
					map.getParentNode().removeChild(map);
					$(window).off('resize', adjust);
				}
			});
			
			if ( settings.markers && settings.markers.length && settings.curr != null ) {
				ll = settings.markers[settings.curr].map;
			} else if ( settings.map ) {
				ll = $.getLatLng(settings.map);
				label = settings.label;
			} else { 
				return;
			}
			
			// reading user prefs
			
			if ( (c = $.cookie('mapType')) !== null ) { 
				settings.type = c;
			}
			
			if ( (c = $.cookie('mapZoom')) !== null ) {
				settings.zoom = parseInt(c, 10) || settings.zoom;
			}
			
			// Leaving 20ms to get the DOM ready before adding the Map
			
			setTimeout( function() {
				
				var m, m0 = new google.maps.Map(
					tmp[0], {
						zoom: settings.zoom, 
						center: ll,
						scrollwheel: false,
						mapTypeId: settings.type.toLowerCase() 
					}
				);				
				
				google.maps.event.addListener(m0, 'maptypeid_changed', function() { 
					$.cookie('mapType', $.fn.addMap.defaults.type = m0.getMapTypeId(), 3600); 
				});
				
				google.maps.event.addListener(m0, 'zoom_changed', function() { 
					$.cookie('mapZoom', $.fn.addMap.defaults.zoom = m0.getZoom(), 3600); 
				});
				
				if ( settings.markers && settings.markers.length > 1 ) {
					var i, mo, mk, 
						first = Math.max(settings.curr - settings.range, 0),
						mx = Math.min(settings.curr + settings.range, settings.markers.length);
					
					var clicked = function() {
						settings.click.call(this); 
					};
					
					for (i = first; i < mx; i++) {
						
						mk = settings.markers[i];
						mo = { 
							position: mk.map, 
							map: m0, 
							title: mk.label,
							icon: (i === settings.curr)? miCurr : miEtc,
							shadow: miShadow,
							zIndex: (i === settings.curr)? 999 : i
						};
												
						// Adding marker
						m = new google.maps.Marker(mo);
						
						// Adding click function
						if ( $.isFunction(settings.click) && mk.link ) {
							m.link = mk.link;
							google.maps.event.addListener(m, 'click', clicked);
						}
						
						// Saving
						markers.push( m );
					}
				} else {
					m = new google.maps.Marker( $.extend({
						position: ll, 
						map: m0, 
						title: label
					}, markerCurr ));
				}
				
				tmp.css({ 
					top: 0 
				}).appendTo(t);
				
				map = m0;
				curr = settings.curr;
				
				// Adding setactive function
				t.on('setactive', function(e, n) {
					//log( 'n:'+n+' ['+first+'-'+curr+'-'+markers.length+']' );
					if ( $.isArray(markers) && markers.length ) {
						if ( curr >= first ) {
							markers[curr].setIcon(markerEtc);
							markers[curr].setZIndex(curr);
						}
						if ( typeof n !== 'undefined' && n >= first && n < first + markers.length ) {
							markers[n - first].setIcon(markerCurr);
							markers[n - first].setZIndex(9999);
							map.setCenter( markers[n - first].position );
							curr = n;
						} else {
							curr = -1;
						}
					}
				});

			}, 20 ); 
			
			$(window).on('resize', function() {
				clearTimeout(to); 
				t.data('fresh', true);
				to = setTimeout(adjust, 100);
			});
		});
	};
	
	$.fn.addMap.defaults = {
		type: 'roadmap',
		zoom: 16,
		range: 30,
		resPath: ''
	};
	
})(jQuery);
