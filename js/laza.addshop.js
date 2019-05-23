/*	
 *	addShop() :: setting up the shopping cart with Paypal
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Items: jQuery element (array) holding the elements
 *
 *	Options:
		target: 'ShoppingCart',
		currency: 'EUR',
		gateway: 'paypal',
		locale: 'US',
		quantityCap: 0,
		shippingFlat: false
 */

;(function($) {
	'use strict';
	
	$.fn.addShop = function(items, settings) {
		
		settings = $.extend( {}, $.fn.addShop.defaults, settings );
		
		if (!items || !items.length || !settings.id) {
			return this;
		}
			
		var UNDEF = 'undefined',
			id = $.fn.addShop.id,
			text = $.fn.addShop.text,
			seller = settings.id.replace('|','@'),
			url = (DEBUG? $.fn.addShop.st.sandboxurl : $.fn.addShop.st.url),
			currency = $.fn.addShop.st.curr_symbol[settings.currency] || settings.currency,
			btnLoc = $.fn.addShop.st.btn_lng[settings.locale] || 'en_US',
			t = $(this).eq(0), 	// target
			f, fs, fv, 			// forms 
			cnt = items.length,	// count
			sd, 				// saved discount
			el, 				// generic jQ el
			target = (cnt > 1)? $.fn.addShop.st.targetCart : $.fn.addShop.st.target,
			options;			// shop options array
			
		var getOptions = function(s) {
			var v = s.split('::'), 
				i, k, p, o, op = [];
		
			for (i = 0; i < v.length; i++) {
				k = v[i].split('=');
				if ( k.length > 1 ) {
					o = {};
					o.label = k[0];
					p = k[1].split('+');
					// Price
					if ((o.price = parseFloat(p[0])) == null)
						continue;
					// Shipping
					if (p.length > 1) {
						o.shipping = parseFloat(p[1]);
					} else {
						o.shipping = 0;
					}
					// Shipping 1+
					if (p.length > 2) {
						o.shipping2 = parseFloat(p[2]);
					} else {
						o.shipping2 = o.shipping;
					}
					// Display text
					o.text = k[0] + ' = ' + currency + ' ' + o.price.toFixed(2) + ((p.length > 1)? ('+' + o.shipping.toFixed(2)) : '');   
					op.push(o);
				}
			}
			
			return op;
		};
		
		// Adding select box
		var addOptions = function(f, op) {
			var i, e = $('<select>').appendTo(f);
			
			for (i = 0; i < op.length; i++) {
				e.append($('<option>', {
					val: op[i].price,
					html: op[i].text
				}));
			}
			
			return e;
		};
		
		// Adding an input
		var addInput = function(f, name, val, type, attr) {
			
			if (!f || !name) {
				return {};
			}
			
			var e = $('<input>', { 
					type: type || 'text'
				}).appendTo(f);
						
			// name
			e.prop('name', name); 
				
			// initial value
			if (val) {
				e.val((typeof val === 'string')? val.stripQuote() : val);
			}
				
			// simple attributes e.g. 'readonly'
			if (attr) {
				e.prop(attr, true);
			}

			return e;
		};

		// Reading or setting discount rate
		var discountRate = function(v) {
			if (typeof v === UNDEF) {
				return value((cnt > 1)? id.discountRateCart : id.discountRate);
			} else {
				if (cnt > 1) {
					value(id.discountRateCart, v);
				} else {
					value(id.discountRate, v);
					value(id.discountRate+'2', v);
				}
			}
		};
		
		// Reading or setting discount amount
		var discountAmount = function(v) {
			if (typeof v === UNDEF) {
				return value((cnt > 1)? id.discountAmountCart : id.discountAmount);
			} else {
				value((cnt > 1)? id.discountAmountCart : id.discountAmount, v);
			}
		};
		
		// Adding discount coupon name to the sent name
		var discountName = function(name, val) {
			var el = fs.children('[name=' + id.option + ']');
			if (el && el.length) {
				var s = el.val().replace(/(\s\(CC\:.+\))$/, '');
				el.val(s + ' (CC:' + name + ((typeof val !== UNDEF)? ('=' + val) : '') + ')');
			}
		};
			
		// set / get float value from fs
		var value = function(id, v) {
			var el = fs.children('[name=' + id + ']');
			if (typeof v === UNDEF) {
				// get
				return (el && el.length)? parseFloat(el.val()) : null;
			} else if (v == null) {
				// remove
				el.remove();
			} else {
				// set
				if (el && el.length) {
					el.val(v);
				} else {
					addInput(fs, id, v, 'hidden');
				}
			}
		};
		
		var curr = function() {
			var el = f.children('select').eq(0);
			return (el && el.length)? el.prop('selectedIndex') : 0;
		};
		
		// Shows total (discounted) price
		var showTotal = function() {
			var i = curr(),
				ed = f.children('.discount').eq(0),
				et = f.children('.total').eq(0),
				q = f.children('[name=copies]').val() || 1,
				pr = options[i].price,
				sh = options[i].shipping + (q - 1) * options[i].shipping2,
				da = discountAmount(),
				dr = discountRate();
			
			if (!ed.length) {
				ed = $('<span>', {
					'class': 'discount'
				}).insertAfter(f.children('select'));
			}
					
			if (da && da > 0) {
				ed.show().html('- ' + currency + ' ' + da.toFixed(2));
				et.html(currency + ' <b>' + (cnt * (q * pr + sh) - da).toFixed(2) + '</b>');
			} else if (dr && dr > 0) {
				ed.show().text('-' + dr + '%');
				et.html(currency + ' <b>' + (cnt * (q * pr * (100 - dr) / 100 + sh)).toFixed(2) + '</b>');
			} else {
				ed.hide();
				et.html(currency + ' <b>' + (cnt * (q * pr + sh)).toFixed(2) + '</b>');
			}
			
		};
			
		// Adjusting shipping fee
		/*
		var adjustShipping = function(v) {
			if (typeof v === UNDEF) {
				v = options[curr()].shipping;
			}
			if (cnt > 1) {
				value(id.handlingCart, (v || 0) * cnt + (settings.handling || 0));
			} else {
				value(id.shipping, v);
				if (!settings.shippingFlat) {
					value(id.shipping2, v);
				}
			}					
		};
		*/
		
		// Select box or Copies has Changed
		var change = function() {
			var i = curr(),
				q = f.children('[name=copies]').val() || 1,
				pr = options[i].price,
				sh = options[i].shipping,
				sh2 = options[i].shipping2;
				
			if ( settings.quantityCap && q > settings.quantityCap ) {
				f.children('[name=copies]').val(q = settings.quantityCap);
			}
			
			if (cnt > 1) {
				for (var j = 1; j <= cnt; j++) {
					value(id.price + '_' + j, pr);
					value(id.copies + '_' + j, q);
					value(id.shipping + '_' + j, sh? sh : null);
					value(id.shipping2 + '_' + j, sh2? sh2 : null);
				}
			} else {
				value(id.price, pr);
				value(id.copies, q);
				value(id.shipping, sh? sh : null);
				value(id.shipping2, sh2? sh2 : null);
			}
			
			value(id.option, options[i].text);
			
			showTotal();
		};
		
		// Validate coupon code
		var validateCoupon = function(feedback) {
			var el, now = new Date(), v, fb = feedback === true;
			
			if (settings.coupons && (el = f.children('[name=coupon]')) && (v = el.val().trim()).length) {
				var i, c, d, 
					cs = xDecrypt(settings.coupons).split('::');
					
				for (i = 0; i < cs.length; i++) {
					
					c = cs[i].split(/=|\s*<\s*/);
					
					if (c[0] === v && c.length > 1) {
						
						d = parseFloat(c[1]);
						if ( d < 0.01 ) {
							// Too small
							continue;
						}
						
						if (c.length > 2) {
							// Checking expiry
							var dt, ex = c[2].split(/-|:|\//);
							if (ex.length < 2) {
								ex[1] = 1;
							}
							if (ex.length < 3) {
								ex[2] = 1;
							}
							dt = new Date(parseInt(ex[0]),parseInt(ex[1]),parseInt(ex[2]));
							
							if (dt < now) {
								// Expired
								$('body').addModal($('<div>', {
									html: text.expired.replace('{0}', v)
								}), {
									type: 'error'
								});
								
								return false;
							}
						}
													
						if (c[1].charAt(c[1].length - 1) === '%') {
							
							// Discount rate
							
							if (d > 99 || d < 1) {
								// Not allowed
								continue;
							}
							
							var dr = discountRate();
							
							if (dr > d) {
								// Lower than current discount
								if (fb) {
									$('body').addModal($('<div>', {
										html: text.lowerThanCurrent.replace('{0}', dr + '%')
									}), {
										type: 'warning'	
									});
								}
							} else {
								// Higher
								if (fb) {
									// Redeem feedback
									$('body').addModal($('<div>', {
										html: text.accepted.replace('{0}', d + '%')
									}), {
										title: text.success	
									});
								}
								
								discountRate(d);
								discountName(v, d + '%');
								$.cookie('discountRate', v, 86400);
							}

						} else if ($.cookie('discount_' + v)) {
							
							// The discount amount has been reclaimed already
							
							if (fb) {
								// Redeem: warning, but no action
								$('body').addModal($('<div>', {
									html: text.reclaimed
								}), {
									type: 'warning'
								});
							} 
							
							// Removing discount amount, adding back the saved rate
							discountAmount(null);
							if (sd) {
								discountRate(sd);
								discountName(v, sd + '%');
							}
							
						} else {
							
							// Discount amount (coupon is not yet used in the past 24 hours)
							
							var dr = discountRate(),
								pr = options[curr()].price,
								da = discountAmount() || ((dr > 0)? (cnt * pr * dr / 100) : 0);
							
							if ((pr * cnt) < d) {
								// Price is lower than discount amount : no go
								if (fb) {
									// Redeem: warning, but no action
									$('body').addModal($('<div>', {
										html: text.higherThanPrice.replace('{0}', currency + '&nbsp;' + d)
									}), {
										type: 'warning'
									});
								}
								
							} else if (da > d) {
								// Previous discount amount is lower than current
								if (fb) {
									// Redeem: warning, but no action
									$('body').addModal($('<div>', {
										html: text.lowerThanCurrent.replace('{0}', currency + '&nbsp;' + da.toFixed(2))
									}), {
										type: 'warning'	
									});
								}
								
							} else {
							
								if (fb) {
									// Redeem: feddback
									$('body').addModal($('<div>', {
										html: text.accepted.replace('{0}', currency + '&nbsp;' + d)
									}), {
										title: text.success
									});
								} else {
									// Saving the coupon for later check
									$.cookie('discount_' + v, d, 86400);
									// Saving current discount rate
									sd = discountRate();
									discountRate(null);
								}
								
								// Adding discount amount
								discountAmount(d);
								discountName(v, settings.currency + ' ' + d);
								
							}
						}
						
						showTotal();
						return true;
					}
				}
				
				// Not found
				$('body').addModal($('<div>', {
					html: text.noSuch
				}), {
					type: 'error'			
				});
				// Do not send the form!
				return false;
			}
			
			// No coupons exists or coupon field is empty
			return true;
		};
		
		var getItemName = function(el) {
			var s;
			
			if (settings.itemNameUses === 'title') {
				if (((s = el.data('tooltip')) && (s = $(s)).length) || (s = el.siblings('.caption')).length || (s = $('.slide .caption')).length) {
					s = s.find('h6,strong');
					if (s.length && (s = s.eq(0).text())) {
						return s.substring(0, 128);
					}
				}
			} else if (settings.itemNameUses === 'comment') {
				if (((s = el.data('tooltip')) && (s = $(s)).length) || (s = el.siblings('.caption')).length || (s = $('.slide .caption')).length) {
					s = s.find('.comment,small');
					if (s.length && (s = s.eq(0).text())) {
						return s.substring(0, 128);
					}
				}
			}
			
			el = el.find('img').eq(0);
			if (el.length) {
				s = el.data('src') || el.attr('src');
			}
			if (!s.length) {
				s = 'untitled';
			}
			
			return decodeURIComponent(s.getFile() + ' [' + settings.path + s.getDir().replace('thumbs/','') + ']')
		};	
			
		/* ***************************************
		 *          Creating the elements 
		 * *************************************** */
		 
		options = getOptions(settings.options);
		
		if (!options.length) {
			return;
		}
		
		// ******** The form to display
		
		f = $('<form>', {
			name: 'shopping',
			method: 'post'
		}).appendTo(t);
		
		// Count
		if (cnt > 1) {
			f.append($('<span>', {
				'class': 'count',
				html: '<b>' + cnt + '</b> &times;' 
			}));
		}
		
		// Options
		el = addOptions(f, options);
		el.on('change', change);

		// Discount
		if (!settings.hasOwnProperty('discount')) {
			settings.discount = $.fn.addShop.defaults.discount || 0;
		}
		if (settings.discount === '-') {
			settings.discount = 0;
		}
		/*	
		if (settings.discount && settings.discount < 100) {
			f.append($('<span>', {
				'class': 'discount',
				text: '-' + settings.discount + '%'
			}));
		}
		*/
		// Quantity
		if (settings.quantityCap !== 1) {
			f.append('&times;');
			el = addInput(f, 'copies', 1);
			el.addClass('copies').on('change', change);
		}
		
		// Total
		f.append('=');
		f.append($('<span>', {
			'class': 'total'
		}));
		
		// Coupon
		if (settings.coupons) {
			f.append($('<input>', {
				type: 'text',
				name: 'coupon',
				'class': 'coupon',
				placeholder: text.couponCode
			}));
			// Redeem btn
			var b = $('<a>', {
				//href: NOLINK,
				html: '&nbsp;',
				'class': 'redeem'
			}).on('click', function(e) {
				e.preventDefault();
				validateCoupon(true);
				return false;
			});
			b.addTooltip(text.redeem);
			f.append(b);
		}
					
		// ********  Add to cart form -> Paypal
			
		fs = $('<form>', {
			name: id.form,
			target: target,
			action: url + 'cgi-bin/webscr/',
			method: 'post'
		}).appendTo(t);
			
		value('cmd', '_cart');
		value('charset', 'utf-8');
		value('lc', settings.locale);
		value(id.seller, seller);
		value(id.currency, settings.currency);
		value(id.shopUrl, settings.continueUrl || decodeURIComponent(window.location.href));
		if ( settings.handling != null && $.isNumeric(settings.handling) ) {
			value(id.handlingCart, settings.handling);
		}
		value(id.option, options[0].label);
		
		if ( settings.discount && settings.discount < 100) {
			discountRate(settings.discount);
		}
		
		if (cnt > 1) {
			
			value('upload', 1);
			value(id.name, cnt + ' ' + text.items);
			//value(id.priceCart, options[0].price * items.length);
			//value(id.handlingCart, (options[0].shipping || 0) * cnt + (settings.handling || 0));
			items.each(function(i) {
				value(id.name + '_' + (i + 1), getItemName($(this)));
			});
				
		} else {
			
			value('add', 1);
			value(id.name, getItemName(items.eq(0)));
		}
		
		change();
		
		fs.append($('<button>', {
			id: 'shopAdd',
			name: 'submit',
			'class': 'paypalbtn',
			html: (cnt > 1)? text.buyNow : text.addCart
		}));
		
		// On submit
		fs.on('submit', function(e) {
			var succ = true, 
				el = $(e.target);
				
			if (settings.coupons) {
				succ = validateCoupon();
			}
			if (succ) {
				el.parents('[data-role=dialog]').trigger('destroy');
				if (!settings.continueUrl) {
					window.open('', target, 'width=1024,height=600,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,directories=no,status=no,copyhistory=no');
				}
				return true;
			}
			return succ;
		});
			
		// if there's a saved coupon
		if (settings.coupons) {
			var v = $.cookie('discountRate');
			if (v) {
				$('input[name=coupon]').val(v);
				validateCoupon(false);
			}
		}
		
		// ********  View cart form -> Paypal
		
		if ( cnt === 1 ) {
			
			fv = $('<form>', {
				'class': 'view',
				name: 'paypalview',
				target: target,
				action: url + 'cgi-bin/webscr/',
				method: 'post'
			}).appendTo(t);
			
			addInput(fv, 'cmd', '_cart', 'hidden');
			addInput(fv, 'lc', settings.locale, 'hidden');
			addInput(fv, id.seller, seller, 'hidden');
			addInput(fv, 'display', 1, 'hidden');
			
			fv.append($('<button>', {
				id: 'shopView',
				'class': 'paypalbtn',
				name: 'submit',
				html: text.viewCart
			}));
			
			// Open in new window
			if (!settings.continueUrl) {
				fv.on('submit', function() {
					window.open('', target, 'width=1024,height=600,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,directories=no,status=no,copyhistory=no');
					return true;
				});
			}
		}
				
		// Initializing total
		showTotal();

		return this;
	};
	
	$.fn.addShop.defaults = {
		currency: 			'EUR',
		locale: 			'US',
		quantityCap: 		0,
		shippingFlat: 		false,
		itemNameUses:		'fileName'
	};
		
	$.fn.addShop.text = getTranslations({
		addCart: 'Add to Cart',
		viewCart: 'View Cart',
		buyNow: 'Buy Now',
		items: 'items',
		success: 'Success',
		couponCode: 'Coupon code',
		redeem: 'Redeem',
		noSuch: 'No such coupon exists!',
		expired: 'The coupon code <b>{0}</b> has expired!',
		accepted: 'The coupon code is accepted. You will get <b>{0}</b> discount the next time you add this item to the cart.',
		lowerThanCurrent: 'This coupon offers lower discount than the current <b>{0}</b>.',
		higherThanPrice: 'You can use this coupon only for items priced higher than <b>{0}</b>.',
		reclaimed: 'This coupon has already been used!'
	});
	
	// Static vars
	$.fn.addShop.st = {
		target: 	'ShoppingCart',
		targetCart:	'BuyNow',
		url: 		'https://www.paypal.com/',
		sandboxurl:	'https://www.sandbox.paypal.com/',
		btn_lng: {
			'DE': 'de_DE', 
			'FR': 'fr_FR', 
			'IT': 'it_IT', 
			'ES': 'es_ES', 
			'PT': 'pt_PT', 
			'DA': 'da_DK', 
			'NL': 'nl_NL', 
			'NO': 'no_NO', 
			'SV': 'sv_SE', 
			'TR': 'tr_TR', 
			'RU': 'ru_RU', 
			'PL': 'pl_PL', 
			'IL': 'he_IL', 
			'TH': 'th_TH'
		},
		curr_symbol: {
			'USD': 'US$',
			'EUR': '&euro;',
			'GBP': 'GB&pound;',
			'JPY': '&yen;',
			'HUF': 'Ft'
		}
	};
	
	// Mapping names
	$.fn.addShop.id = {
		'form':				'paypal',
		'seller':			'business',
		'currency':			'currency_code',
		'name':				'item_name',
		'option':			'item_number',
		'custom':			'custom',
		'price':			'amount',
		'priceCart':		'amount_1',
		'copies':			'quantity',
		'discountRate':		'discount_rate',
		'discountRateCart':	'discount_rate_cart',
		'discountAmount':	'discount_amount',
		'discountAmountCart':'discount_amount_cart',
		'shipping':			'shipping',
		'shipping2':		'shipping2',
		'handlingCart':		'handling_cart',
		'shopUrl':			'shopping_url'
	};			

})(jQuery);
