<%-- Script starter --%>
		var t=$('#main');
		<%-- index page --%>
<ja:if test="${pageType}" value="index">
		<%-- Turtle gallery --%>
		var i=t.find('.thumbs'),f=t.find('.folders td');
		i.turtle({
			resPath:'${resPath}',relPath:'<%= util.escQuot(relPath) %>',<ja:if test="${level}" not value="0">level:${level},</ja:if><ja:if test="${skipIndex}">skipIndex:!0,</ja:if><ja:if not test="${makeSlides}"><ja:if exists="previousFoldersLast">previousFoldersLast:'<%= util.urlEncodeSafe(previousFoldersLast) %>',</ja:if><ja:if exists="nextFoldersFirst">nextFoldersFirst:'<%= util.urlEncodeSafe(nextFoldersFirst) %>',</ja:if></ja:if>
			${jsGlobalVars}
			${jsIndexVars}
			<ja:if test="${thumbCount}" not value="0">${jsShopVars}</ja:if>
			<ja:if test="${locationCount}" not value="0">${jsMapVars}</ja:if>
			<ja:if not test="${makeSlides}">
			<%-- Only for dynamic mode --%>
			<ja:if test="${videoCount}" not value="0">${jsVideoVars}</ja:if>
			<ja:if test="${useFotomoto}">fotomotoOn:${useFotomoto},</ja:if>
			<ja:if exists="imgHook">imgHook:'<%= util.escQuot(engine.processTemplate(imgHook)) %>',${jsImgHookVars}</ja:if>
			</ja:if><ja:else>
			<%-- Separate slides mode --%>
			</ja:else>
			cols:${thumbCols}
		});
		<ja:if test="<%= newDays > 0 %>">f.length && f.find('aside img').markFoldersNew({<ja:if test="${newDays}" value="0">ref:${today},</ja:if>days:${newDaysCount},text:'<span class="newlabel"><%= util.getText("newItem") %></span>'});</ja:if>
</ja:if><ja:else>
<ja:include page="templates/${label}-scripts.inc" />
</ja:else>
		<ja:if test="${smartScroll}">
		<%-- Fixing long menus --%>
		<ja:if test="${splashVertical}">
		if ($('.top-nav').height()>40) $('#main .items').css({top:($('.top-nav').height() + 20)});
		</ja:if>
		<%-- Adding custom scroller to items and left box --%>
		<ja:if test="${splashVertical}">t.find('.left-box>.cont').addScroll({<ja:if test="<%= facebookCommentsOn || disqusCommentsOn %>">refresh:500,</ja:if><ja:if not test="${enableMouseWheel}">enableMouseWheel:!1,</ja:if>enableKeyboard:!1});</ja:if>
		t.find('.items>.cont').addScroll({<ja:if test="<%= !splashVertical && (facebookCommentsOn || disqusCommentsOn) %>">refresh:500,</ja:if><ja:if not test="${enableMouseWheel}">enableMouseWheel:!1,</ja:if><ja:if not test="${enableKeyboard}">enableKeyboard:!1,</ja:if>focusActive:!<ja:if test="${focusCurrentThumb}">0</ja:if><ja:else>1</ja:else>});
		</ja:if><ja:else>
		<%-- Normal browser scrolling --%>
		$('#main').loadImages().on('scroll touchend',function(){$(this).loadImages();});
		</ja:else>
		<%-- Help --%>
		$('.helplink').turtleHelp({<ja:if not test="${enableKeyboard}">useF1:!1,</ja:if><ja:if not test="${skipIndex}">index:!0,</ja:if>slide:!0});
		<%-- Adding mouseover hints --%>
		var al=[<ja:if test="${splashVertical}">2,1,0,1</ja:if><ja:else>1,0,1,2</ja:else>];
		$('aside .controls:not(.share,.search)>a').addTooltip({pos:al,touchToggle:!1});
		$('aside .controls.search>a').addTooltip({pos:al,touchToggle:!0});
		$('.parent.controls>a').addTooltip({pos:al,touchToggle:!<ja:if test=<%= level > 0 && pageType.equals("index") %>>0</ja:if><ja:else>1</ja:else>});
		$('#navigation .home>a,footer [data-tooltip],.bulkactions [data-tooltip]').addTooltip();
		<%-- Setting up share buttons :: delayed by 100ms --%>
		<ja:if test="${anyShares}">
		<ja:if test="${shareBoxType}" value="dropdown">setTimeout(function(){t.find('.share a').addSocial({useHash:!1,pos:al,<ja:if not test="${shareLabelsVisible}">buttonLabels:!1,</ja:if>width:120,${shareArray}});},500);</ja:if>
		<ja:else>setTimeout(function(){t.find('.shareactions').addSocial({useHash:!1,inline:!0,<ja:if not test="${shareLabelsVisible}">buttonLabels:!1,</ja:if>${shareArray}});},200);</ja:else>
		</ja:if>
		<%-- Search --%>
		<ja:if test="${useSearch}">$('#searchinp>.searchtext').on('keydown',function(e){if(e.which===13 && Search){Search.start(this.parentNode);return false;}});
		$('#searchinp>.button').on('click',function(){if(Search)Search.start(this.parentNode);return false;});
		</ja:if>
		<%-- Background audio --%>
		<ja:if exists="backgroundAudio">
		$('#bgaudio').addPlayer({src:'<%= util.escQuot(backgroundAudio) %>',<ja:if test="${useAlbumAudioAsBackground}" value="false">folder:'${resPath}/',</ja:if>resPath:'${resPath}',auto:${backgroundAudioAutoPlay},loop:${backgroundAudioLoop},<ja:if test="${backgroundAudioRetainPosition}">saveStatus:!0,</ja:if>mini:!0,lowPriority:!0,volume:0.4});</ja:if>
		<%-- Album info display on click --%>
		<ja:if exists="pageHeader">t.find('.about>a').on('click',function(){$('body').addModal($('.header').contents().clone(),{uid:'albuminfo',resizable:!0,defaultButton:'okButton',width:(t.find('.items').width()-240),savePosition:!0});return false;});</ja:if>