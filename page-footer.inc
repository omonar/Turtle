<%-- Page footer --%>
<ja:if test="${pageType}" not value="slide">
				<ja:if test="${pageType}" value="page"></article></ja:if>
				<ja:if not test="${splashVertical}">
					<ja:if test="${facebookCommentsOn}"><div class="fb-comments" id="fb-comments" data-num-posts="${facebookCommentingPosts}" data-width="${galleryWidth}" data-colorscheme="${likeBtnTheme}"<ja:if exists="pageUrl"> data-href="${pageUrl}"</ja:if>></div></ja:if>
					<ja:if test="${disqusCommentsOn}"><div class="disqus-comments" id="disqus-comments"><div id="disqus_thread"></div></div></ja:if>
				</ja:if>
				<%-- Index page footer --%>
				<% getFooterLinks(); %>
				<ja:if test="<%= pageFooter != void && !util.isEmpty(pageFooter) ||
					promotion != void && !util.isEmpty(promotion) ||
					footerLinks != void && !util.isEmpty(footerLinks) %>">
				<footer><div class="wrap">
					<ja:if exists="pageFooter"><div class="custom-footer">${pageFooter}</div></ja:if>
					<ja:if exists="promotion"><div class="promotion">${promotion}</div></ja:if>
					<ja:if exists="footerLinks"><div class="footer-links">${footerLinks}</div></ja:if>
					<noscript>$text.javascriptWarning</noscript>
				</div></footer>
				</ja:if>
			</div>
		</div>
		<ja:if test="${splashVertical}"></div></ja:if>
		<ja:if exists="pageHeader"><div class="header hidden">${pageHeader}</div></ja:if>
	</div></div>
	
	<%-- Background audio --%>
	<ja:if exists="backgroundAudio"><div id="bgaudio"></div></ja:if>
	
</ja:if>
	<%-- Facebook commenting container --%>
	<ja:if test="${facebookCommentsOn}"><div id="fb-root"></div></ja:if>
	<%-- Hooks for CSS preload --%>
	<div class="hook"><span class="hook-b">&nbsp;</span><span class="hook-c">&nbsp;</span><span class="hook-s">&nbsp;</span></div>
	
<%-- Extra JavaScript libraries --%>
<ja:if test="${locationCount}" not value="0"><script src="https://maps.google.com/maps/api/js?<ja:if exists="googleApiKey">key=${googleApiKey}&</ja:if>"></script></ja:if>
<%-- jQuery library :: Google CDN first --%>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.js"></script>
<script>window.jQuery || document.write('<script src="${resPath}/jquery-1.12.4.min.js"><\/script>');</script>
<%-- jPlayer for any video or audio content --%>
<ja:if test="<%= anyMedia || !util.isEmpty(backgroundAudio) %>"><script src="${resPath}/jquery.jplayer${min}.js"></script></ja:if>
<ja:if test="${searchOn}"><script src="${resPath}/search.js?v=${uniqueID}" charset="utf-8"></script></ja:if>
<%-- The skin --%>
<script src="${resPath}/all${min}.js?v=${skinVersion}" charset="utf-8"></script>
<script>
	_jaWidgetBarColor='${widgetBarColor}';
	<%-- Page initialization scripts --%>
	$(document).ready(function(){			
		<%-- Disable navigation keys during widget use --%>
		var enableKeys=<%= (enableKeyboard? "function(){return typeof _jaWidgetFocus==='undefined' || !_jaWidgetFocus;}" : enableKeyboard) %>;
		<ja:if test="${pageType}" value="slide">
<ja:include page="slide-scripts.inc" />
		</ja:if><ja:else>
<ja:include page="index-scripts.inc" />
		</ja:else>
		<%-- Search --%>
		<ja:if test="${searchOn}">setTimeout(function(){if(typeof Search!=='undefined'){Search.init('${rootPath}');}},100);</ja:if>
	});
	<%-- Post loading libraries :: only from web --%>
	if(location.protocol!=='file:') {
	<%	/* Loading social plugins with Modernizr */
		if (tumblrButton || facebookCommentsOn || disqusCommentsOn || pinItButton) {
			StringBuilder sb = new StringBuilder(512);
			out.print("\tModernizr.load({load:[");
			if (tumblrButton) sb.append("'https://platform.tumblr.com/v1/share.js'");
			if (disqusCommentsOn) sb.append(((sb.length() > 0)? ",":"") + "'https://" + disqusAppId + ".disqus.com/embed.js'");
			if (pinItButton) sb.append(((sb.length() > 0)? ",":"") + "'https://assets.pinterest.com/js/pinit.js'");
			if (facebookCommentsOn) sb.append(((sb.length() > 0)? ",":"") + "'https://connect.facebook.net/" + util.locale + "/sdk.js#xfbml=1&appId=" + facebookAppId + "&version=v2.0'");
			out.print(sb.toString());
			out.print("]");
			if (facebookCommentsOn) out.print(",complete:function(){fixFbComments('" + ((pageType != void && pageType.equals("page"))? (label + util.pageExt) : util.indexName) + "');}");
			out.print("});");
		}
	%>
		<%-- Loading Google Plus :: delay=500ms --%>
		<ja:if test="${googlePlus}">setTimeout(function(){$.ajax({url:'https://apis.google.com/js/plusone.js',dataType:'script',parameters:{parsetags:'explicit'}});},500);</ja:if>
		<%-- Loading Fotomoto library :: delay=600ms --%>
		<ja:if test="${useFotomoto}">setTimeout(function(){Modernizr.load('https://widget.fotomoto.com/stores/script/${fotomotoID}.js?api=true${fotomotoAid}');},600);</ja:if>
	}
	
<%-- Javascript hook --%>
<ja:if exists="jsHook"><%= engine.processTemplate(jsHook) %></ja:if>
</script>

<%-- Widget inclusion relocated --%>
<ja:widget pageType="index" />

<%-- User defined BODY code --%>
<ja:if exists="bodyHook"><%= engine.processTemplate(bodyHook) %></ja:if>

<%-- Google Analytics code --%>
<ja:if not test="${googleAnalytics}" value="none"><ja:if exists="googleSiteID"><script>
if(location.protocol!=='file:') {
	<ja:if test="${googleAnalytics}" value="classic">
	var _gaq=_gaq||[];_gaq.push(['_setAccount','${googleSiteID}']);_gaq.push(['_trackPageview']);
	(function(d){var ga=d.createElement('script');ga.async=true;ga.src=<ja:if test="${supportDoubleclick}">'https://stats.g.doubleclick.net/dc.js'</ja:if><ja:else>('https:'==d.location.protocol?'https://ssl':'http://www')+'.google-analytics.com/ga.js'</ja:else>;
		var s=d.getElementsByTagName('script')[0];s.parentNode.insertBefore(ga,s);
	})(document);
	</ja:if><ja:else>
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
	ga('create','${googleSiteID}','auto');<ja:if test="${supportDoubleclick}">ga('require','displayfeatures');</ja:if>ga('send','pageview');
	</ja:else>
}
</script></ja:if></ja:if>
</body>
</html>