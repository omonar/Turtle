				<%-- Images, videos and other files --%>
				<ja:if test="${thumbCount}" not value="0"><table class="thumbs"><tr>
					<% i = 0; lc = 0; %><ja:fileiterator exclude="folder,webLocation" nodirs>
					<%	/* images.inc */

						updateLocal();
												
						if (!(useAlbumAudioAsBackground && Category.audio == _category)) {
							
							if (i > 0 && i % thumbCols == 0) {
								out.print("</tr><tr>");
							}
							
							out.print("<td>");
							
							// Link to closeup: a HTML page or the image / video itself
							out.print("<a href=\"" + (util.makeSlides? (util.slidesDir + "/" + util.urlEncode(label) + util.pageExt) : _imagePath) + "\"");
							
							// Thumbnail caption as tooltip
							if (captionPlacement.equals("tooltip"))
								out.print(util.data("tooltip", "#tt" + i));
							
							out.print(">"); // <a>
							
							// Noscript thumbnail
							if (useNoscript != void && useNoscript)
								out.print("<noscript><img src=\"" + thumbPath + "\" alt=\"" + _alt + "\" width=\"" + thumbWidth + "\" height=\"" + thumbHeight + "\"></noscript>");
							
							// The thumbnail as iconPath or "blank.png"
							out.print("<img src=\"" + _thumbPath + "\"");
							out.print(util.attr("width", thumbWidth));
							out.print(util.attr("height", thumbHeight));
							
							// Alt tags for SEO
							out.print(util.attr("alt", _alt));
							
							// closeup and thumbnail extensions
							out.print(util.data("src", thumbPath));
							out.print(util.data("ext", _ext));
							if (!_ext.equals(_thumbExt)) {
								out.print(util.data("thumbext", _thumbExt));
							}
							
							// Image data
							if (!util.makeSlides) {
								out.print(util.data("caption", util.cleanup(_caption)));
							}
							
							// Modified days for NEW label
							if (_modifiedDays > 0L) {
								out.print(util.data("modified", _modifiedDays));
							}
							
							// File size
							out.print(util.data("size", _fileSize));
							
							// Link to original
							if (!util.isEmpty(_link)) { 
								out.print(util.data("link", _link));
								if (_original) {
									out.print(util.data("isoriginal", "true"));
								}
							}
							
							// Link to closeup images if makeSlides
							if (util.makeSlides && !util.copyOriginals) {
								out.print(util.data("closeup", imagePath));
							}
							
							// Type-spcific parameters
							out.print(util.data("is" + _category.toString().toLowerCase(), "true"));
							
							switch(_category) {
								
								case image:
									
									out.print(util.data("width", imageWidth));
									out.print(util.data("height", imageHeight));
									out.print(util.data("meta", _meta));
									out.print(util.data("regions", _regions));
									break;
								
								case audio:
								case video:
									
									out.print(util.data("width", _boxWidth));
									out.print(util.data("height", _boxHeight));
									out.print(util.data("poster", _imagePath)); 
									//(iconPath == void || util.isEmpty(iconPath) && !linkOriginals)? imagePath : resPath + "/" + _category.toString() + ".poster.jpg"));
									break;
								
								default:
									
									if (_external != null && _external.length() > 0) {
										out.print(util.data("content", _external.replaceAll("\"","&#34;")));
									}
									
									if (_boxWidth > 0 && _boxHeight > 0) {
										out.print(util.data("width", _boxWidth));
										out.print(util.data("height", _boxHeight));
									}
							}
							
							// Map data
							// System.out.println("images.inc: "+fileName+" _gpsLocation:"+_gpsLocation+" location:"+location);
							if (_gpsLocation != void && !util.isEmpty(_gpsLocation)) {
								out.print(util.data("map", util.stripQuot(_gpsLocation)));
								out.print(util.data("mapid", lc));
								lc++; 
							}
							
							// Shop data
							if ((shopOnSlide || shopOnIndex) && _shop != void && !util.isEmpty(_shop)) {
								// System.out.println("Shop[" + fileName + "] = " + (_shop.equals(shopOptionsDefault)? "+" : _shop));
								out.print(util.data("shop", (_shop.equals(shopOptionsDefault)? "+" : _shop)));
								shopCount++;
								// Discount
								if (_discount != void && !util.isEmpty(_discount) && !_discount.equals(shopDiscountRateDefault)) {
									out.print(util.data("discount", util.stripQuot(_discount)));
								}
							}							
							
							// Mostphotos data
							if (useMostphotos && buyImageUrl != void && !util.isEmpty(buyImageUrl)) {
								out.print(util.data("mostphotos", util.stripQuot(buyImageUrl.replaceAll("http:/www.mostphotos.com/", "").replaceAll("https:/www.mostphotos.com/", ""))));
							}
							
							out.print(">"); // <img>
							
							// Mark as new since added (hardwired)
							// System.out.println("newDays="+newDays+" _modifiedDays="+_modifiedDays+" newDaysCount="+newDaysCount);
							if (newDays == 0 && (today - _modifiedDays) <= newDaysCount)
								out.print("<span class=\"newlabel\">" + util.getText("newItem") + "</span>");
							
							// Checkbox
							if (bulkActionsOn) {
								out.print("<span class=\"checkbox\">&nbsp;</span>");
							}

							out.print("</a>");
							
							// Thumbnail caption
							if (!util.isEmpty(_thumbCaption)) {
								out.print("<div class=\"caption" + (captionPlacement.equals("tooltip")? (" hidden\" id=\"tt" + i) : "") + "\">" + _thumbCaption + "</div>");
							}
							
							out.println("</td>");
							
							i++;
						}
					%></ja:fileiterator>
					<%	while ((i % thumbCols) > 0) {
							out.print("<td class=\"empty\">&nbsp;</td>");
							i++;
						}
					%>
				</tr></table>
				
				</ja:if>

