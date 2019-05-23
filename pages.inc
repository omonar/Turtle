				<%-- Pages --%>
				<ja:if test="<%= !(hidePagesIfTopnav && showTopNavigation && level == 0) && pageCount != void && pageCount > 0 %>"><table class="folders pages"><tr>
					<%	/* pages.inc */
						int i = 0, j;
						String t;
						for ( AlbumObject ao : currentFolder.getChildren() ) {
							if ( (ao.getCategory() == Category.webPage) && ao.isIncluded() && !ao.isHidden()) {
								if ( i > 0 && (i % folderCols) == 0 ) {
									out.print("</tr><tr>");
								}
								vars = ao.getVars();
								t = vars.get("title");
								if (util.isEmpty(t)) {
									t = vars.get("label");
								}
								if (t == null) {
									t = "";
								}
								if (t.equals("NewPhotos"))
									t = util.getText("newPhotos");
								else if (t.equals("TumblrFeed"))
									t = util.getText("tumblrFeed");
								out.print("<td>");
								out.print("<div class=\"data\"><h4><a href=\"" + vars.get("closeupPath") + "\">" + t + "</a></h4>");
								if ( showPageExcerpt ) {
									_caption = vars.get("comment");
									if ( _caption != null && !util.isEmpty(_caption) ) {
										try {
											_caption = engine.processTemplate(preFormat? util.formatPlainText(_caption) : _caption);
										} catch (ElementException e) {
											util.log("Error processing page comment", e);
										}
										j = _caption.indexOf("<!--more-->");
										if (j > 0) {
											_caption = _caption.substring(0, j) + " <a href=\"" + vars.get("closeupPath") + "\" class=\"readmore\">" + util.getText("ui.readMore") + " &rarr;</a>";
										} else if ( (_caption.length() > 640) || (shortenComments && (_caption.length() > 160)) ) {
											_caption = util.shorten(util.stripHTML(_caption));
										}
										if ( !util.isEmpty(_caption) )
											out.print("<div class=\"caption\">" + _caption + "</div>");
									}
								}
								out.print("</div></td>");
								i++;
							}
						}
						if ( folderCols > 1 ) {
							while ( (i % folderCols) > 0 ) {
								out.print("<td class=\"empty\">&nbsp;</td>");
								i++;
							}
						}
					%>
				</tr></table>
				</ja:if>

