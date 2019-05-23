				<%-- Thumbnails --%>
				<table class="thumbs"><tr>
				<%
					int i = 0;
					Category _cat;
					Scope _v;
					long days,
						nDays = (showAsNewFor != void && !util.isEmpty(showAsNewFor))? Integer.parseInt(showAsNewFor) : 0;
					String _ic, _tc, _ip, _tp, _orp, _hrp, _li, _ext, _mpurl, _ofp, _sh, _dc;
					boolean _orig;
					int _tw, _th;
					String ref = (newPhotosDaysRef == void)? "added" : newPhotosDaysRef;
		
					void getNewItems( AlbumObject folder, String relPath ) {
						
						for (AlbumObject ao : folder.getChildren()) {
							if (!ao.isHidden() && ao.isIncluded()) {
								_cat = ao.getCategory();
								if (_cat == Category.folder) {
									getNewItems(ao, relPath + ao.getWebName() + "/");
								} else if (_cat != Category.webPage) {
									_v = ao.getVars();
									
									switch (ref) {
										case "dateTaken":
											days = util.fileDateTakenDays(ao);
											break;
										case "fileModified":
											days = util.fileModifiedDays(ao);
											break;
										default:
											days = (int)(ao.getWhenAdded() / 86400000L);
									}
										
									if ((today - days) <= nDays) {
										if ( i > 0 && i % thumbCols == 0 ) {
											out.print("</tr><tr>");
										}
										out.print("<td>");
										_ic = (imgCaptionTemplate == void || imgCaptionTemplate == null)? 
											ao.getComment() : util.processTemplate(ao, imgCaptionTemplate, i + 1);
										if ( _ic == null )
											_c = "";
										_tc = (thumbCaptionTemplate == void || thumbCaptionTemplate == null)? 
											ao.getComment() : util.processTemplate(ao, thumbCaptionTemplate, i + 1);
										if ( _tc == null )
											_tc = "";
										_tw = _v.get("thumbWidth");
										_th = _v.get("thumbHeight");
										_tp = _v.get("thumbPath");
										_ip = _v.get("imagePath");
										_hrp = _v.get("hiResPath");
										_orp = _v.get("originalPath");
										_li = ( _cat == Category.image && _hrp != void && _hrp != null )? 
											_hrp : ( (_orp != void && _orp != null)? _orp : "" );
										_orig = (_hrp == void || _hrp == null) && (_orp != void && _orp != null);
										_ext = util.getExt(_ip);
										_mpurl = (useMostphotos)? _v.get("buyImageUrl") : "";
										
										if (util.makeSlides) {
											_ofp = relPath + _v.get("closeupPath");
										} else {
											_ofp = relPath + _tp.replace(util.thumbsDir + "/", (util.indexName + '#'));
											if (_cat != Category.image && _orp != null) {
												_ofp = util.replaceExt(_ofp, "." + util.getExt(_orp));
											}
										}
										
										_tc += "<a href=\"" + _ofp + "\" class=\"original\">" + util.getText("originalFolder") + " &rarr;</a>";
										
										// Link to closeup: a HTML page or the image / video itself
										out.print("<a href=\"" + (util.makeSlides? _ofp : (relPath + _ip)) + "\"" +
											// Thumbnail caption as tooltip
											((captionPlacement == void || captionPlacement.equals("tooltip"))? (" title=\"" + util.cleanup(_tc) + "\"") : "")
											+ ">");
										
										// Noscript thumbnail
										if ( useNoscript != void && useNoscript )
											out.print("<noscript><img src=\"" + relPath + _tp + "\" width=\"" + _tw + "\" height=\"" + _th + "\"></noscript>");
										
										// The thumbnail as iconPath or "blank.png"
										out.print("<img src=\"" + resPath + "/blank.png" + "\"");
										out.print(util.attr("width", _tw));
										out.print(util.attr("height", _th));
										
										// closeup and thumbnail extensions
										out.print(util.data("src", relPath + _tp));
										
										/*
										out.print(util.data("ext", _ext));
										if ( !_ext.equals(_thumbExt) )
											out.print(util.data("thumbext", _thumbExt));
										*/
										// Image data
										if ( !util.makeSlides )
											out.print(util.data("caption", util.cleanup(_ic)));
										/*
										// Modified days for NEW label
										if ( _modifiedDays > 0L )
											out.print(util.data("modified", _modifiedDays));
										
										// File size
										out.print(util.data("size", _fileSize));
										*/
										// Link to original
										if ( !util.isEmpty(_li) ) { 
											out.print(util.data("link", relPath + _li));
											if ( _orig ) 
												out.print(util.data("isoriginal", "true"));
										}
		
										// Link to closeup images if makeSlides
										if ( util.makeSlides && !util.copyOriginals ) {
											out.print(util.data("closeup", _ip));
										}
										
										// Type-spcific parameters
										out.print(util.data("is" + _cat.toString().toLowerCase(), "true"));
										switch( _cat ) {
											
											case image:
												
												out.print(util.data("width", _v.get("imageWidth")));
												out.print(util.data("height", _v.get("imageHeight")));
												//out.print(util.data("meta", _meta));
												//out.print(util.data("regions", _regions));
												break;
											
											case audio:
											case video:
												
												out.print(util.data("width", _v.get("videoWidth")));
												out.print(util.data("height", _v.get("videoHeight")));
												out.print(util.data("poster", relPath + _ip));
												anyMedia = true;
												//(iconPath == void || util.isEmpty(iconPath) && !linkOriginals)? imagePath : resPath + "/" + _category.toString() + ".poster.jpg"));
												break;
											
											default:
												/*
												if ( externalContent != void && !util.isEmpty(externalContent) )
													out.print(util.data("content", (engine.processTemplate(externalContent)).replaceAll("\"","&#34;")));
												if ( _boxWidth > 0 && _boxHeight > 0 ) {
													out.print(util.data("width", _boxWidth));
													out.print(util.data("height", _boxHeight));
												}
												*/
										}
										/*
										// Map data
										if ( _gpsLocation != void && !util.isEmpty(_gpsLocation) ) {
											out.print(util.data("map", util.stripQuot(_gpsLocation)));
											out.print(util.data("mapid", lc));
											lc++; 
										}
										*/
										
										// Shop data
										if (shopOnSlide || shopOnIndex ) {
											_sh = util.getShop(ao);
											if (!util.isEmpty(_sh)) {
												out.print(util.data("shop", (_sh.equals(shopOptionsDefault)? "+" : _sh)));
												// Discount
												_dc = _v.get("shopDiscountRate").toString().trim();
												if (!util.isEmpty(_dc)) {
													_dc = _dc.replaceAll("%", "");
													if (!_dc.equals(shopDiscountRateDefault)) {
														out.print(util.data("discount", util.stripQuot(_dc)));
													}
												}
											}
										}
										
										// Mostphotos data
										if ( !util.isEmpty(_mpurl) ) {
											out.print(util.data("mostphotos", util.stripQuot(_mpurl)));
										}
										
										out.print(">");
											
										// out.print("<span class=\"newlabel\">" + util.getText("newItem") + "</span>");
										
										// Checkbox
										if ( bulkActionsOn )
											out.print("<span class=\"checkbox\">&nbsp;</span>");
			
										out.print("</a>");
										
										// Thumbnail caption placed below
										if ( captionPlacement != void && captionPlacement.equals("below") )
											out.print("<div class=\"caption\">" + _tc + "</div>");
										
										out.println("</td>");
										
										i++;
									}
								}
							}
						}
					}
										
					getNewItems(currentFolder, "");
					
					while ( (i % thumbCols) > 0 ) {
						out.print("<td class=\"empty\">&nbsp;</td>");
						i++;
					}
				%>
				</tr></table>
