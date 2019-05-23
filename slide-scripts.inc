<%-- Script starter :: slides --%>
		$('.img').turtle({
			resPath:'${resPath}',relPath:'<%= util.stripQuot(relPath) %>',<ja:if test="${level}" not value="0">level:${level},</ja:if>firstPage:'<%= util.stripQuot(firstPage) %>',lastPage:'<%= util.stripQuot(lastPage) %>',indexPage:'../${indexPage}',<ja:if exists="previousFoldersLast">previousFoldersLast:'<%= util.escQuot(previousFoldersLast) %>',</ja:if><ja:if exists="nextFoldersFirst">nextFoldersFirst:'<%= util.escQuot(nextFoldersFirst) %>',</ja:if>
			${jsGlobalVars}
			<ja:if exists="_shop">${jsShopVars}</ja:if>
			<ja:if test="${mapOnSlide}"><ja:if exists="_gpsLocation">${jsMapVars}</ja:if></ja:if>
			<ja:if test="${useFotomoto}">fotomotoOn:!0,</ja:if>
			<ja:if exists="imgHook">imgHook:'<%= util.stripQuotes(engine.processTemplate(imgHook)) %>',${jsImgHookVars}</ja:if>
			curr:<%= imageNum - 1 %>
		});
		<%-- Fixing Facebook commenting width --%>
		<ja:if test="${facebookCommentsOn}">$('.fb-comments').attr('data-width',($('.gallery .bottom .cont').width() - 60));</ja:if>
		<%-- Help --%>
		$('.helplink').turtleHelp({<ja:if not test="${enableKeyboard}">useF1:!1,</ja:if>index:!1,slide:!0});
		<%-- Preloading next and previous photo --%>
		<ja:if exists="next">$('<img>',{src:'<%= util.stripQuot(next.get("imagePath")) %>'});</ja:if>
		<ja:if exists="previous">$('<img>',{src:'<%= util.stripQuot(previous.get("imagePath")) %>'});</ja:if>
		<%-- jPlayer component: HTML5 -> Flash --%>
		<ja:if test="${anyMedia}">$('.main.video, .main.audio').addPlayer({elem:'a:first',${videoVars}resPath:'${resPath}'});</ja:if>
