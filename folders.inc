				<%-- Folders --%>
				<ja:if test="<%= folderCount > 0 || webLocationCount > 0 %>"><table class="folders"><tr>
				<% i = 0; %><ja:fileiterator include="folder,webLocation" dirs>
					<%	/* folders.inc */
						if (i > 0 && (i % folderCols) == 0) {
							out.print("</tr><tr>");
						}
						
						updateLocal();
						
						out.print("<td>");
						out.print("<aside><a href=\"" + _link + "\">");
						out.print("<img src=\"" + _thumbPath + "\"" + 
							util.attr("alt", util.cleanup(_title)) + 
							util.attr("width", thumbWidth) + 
							util.attr("height", thumbHeight) +
							((_modifiedDays > 0L)? util.data("modified", _modifiedDays) : "") +
							" />");
						if (newDays == 0 && (today - _modifiedDays) <= newDaysCount)
							out.print("<span class=\"newlabel\">" + util.getText("newItem") + "</span>");
						out.print("</a></aside>");
						out.print("<div class=\"data\"><h4><a href=\"" + _link + "\">" + util.stripLinebreak(_title) + "</a></h4>");
						if (showFolderDescription && !util.isEmpty(_caption))
							out.print("<div class=\"caption\">" + _caption + "</div>");
						if (showFolderImageCount && _fileCount > 0) {
							out.print("<p class=\"info\">" + _counters + "</p>");
						}
						out.print("</div></td>");
						i++;
					%></ja:fileiterator>
					<%	/* Empty cells */
						if (folderCols > 1) {
							while ((i % folderCols) > 0) {
								out.print("<td class=\"empty\">&nbsp;</td>");
								i++;
							}
						}
					%>
				</tr></table>
				</ja:if>

