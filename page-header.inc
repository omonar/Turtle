<!DOCTYPE html>
<%
	// Initializing variables for the current album page
	initPage();			
%>
<!--[if lt IE 8]><html ${htmlAttr} class="no-js ie7 oldie"><![endif]-->
<!--[if IE 8]><html ${htmlAttr} class="no-js ie8 oldie"><![endif]-->
<!--[if IE 9]><html ${htmlAttr} class="no-js ie9"><![endif]-->
<!--[if gt IE 9]><!--> <html ${htmlAttr} class="no-js"> <!--<![endif]-->
<head>
	<meta charset="${textEncoding}">
	<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge"><![endif]-->
	<title>${_title}</title>
	<ja:if exists="captionClean"><meta name="description" content="${captionClean}"></ja:if>
	<ja:if exists="writer"><meta name="author" content="<%= util.cleanup(writer) %>"></ja:if>
	<meta name="generator" content="Created with jAlbum ${internalVersion} &amp; ${skinName} ${skinVersion}, ${styleName} style :: album creation date ${currentDate}<ja:if test="${excludeCredits}" not value="true"> :: ${license}<%= (util.license.length() == 0)? "unregistered" : "" %></ja:if>">
	<meta name="keywords" content="<ja:if exists="keywords">${keywords}, </ja:if><ja:if test="${pageType}" value="index">${albumTags}</ja:if>"> 
	<ja:if exists="pageUrl"><meta property="og:url" content="${pageUrl}"></ja:if>
	<meta property="og:title" content="${_title}">
	<meta property="og:type" content="website">
	<ja:if test="<%= (facebookLike != void && facebookLike || facebookCommentsOn) %>"><ja:if exists="facebookAdmins"><meta property="fb:admins" content="${facebookAdmins}"></ja:if>
	<ja:if exists="facebookAppId"><meta property="fb:app_id" content="${facebookAppId}"></ja:if></ja:if>
	<ja:if exists="captionClean"><meta property="og:description" content="<%= util.shorten(captionClean) %>"></ja:if>
	<ja:if exists="pageThumbPath"><meta property="og:image" content="${pageThumbPath}">
	<link rel="image_src" href="${pageThumbPath}"></ja:if>
	<meta name="viewport" content="user-scalable=yes, width=${containerWidth}, minimal-ui">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="format-detection" content="telephone=no">
	<meta name="robots" content="index,follow">
	<link rel="stylesheet" href="${resPath}/common.css?v=${skinVersion}">
	<noscript><style>.helplink, #main header .title .controls.share, #main header .title .controls.search { display:none; }</style></noscript>
	<ja:if test="${useFavicon}"><link rel="apple-touch-icon-precomposed" href="${resPath}/apple-touch-icon-144x144-precomposed.png">
	<link rel="icon" href="${resPath}/favicon-32x32.png" sizes="32x32">
	<!--[if IE]><link rel="shortcut icon" href="${resPath}/favicon.ico"><![endif]-->
	<meta name="msapplication-TileColor" content="#1d95af">
	<meta name="msapplication-TileImage" content="${resPath}/tileicon.png"></ja:if>
	<script src="${resPath}/modernizr-2.6.2.min.js"></script>
	<ja:if exists="headHook"><%= engine.processTemplate(headHook) %></ja:if> <%-- User defined HEAD code --%>
</head>
<body id="${pageType}" class="${pageType} ${_category} <ja:if test="${level}" not value="0">sub-album</ja:if><ja:else>top-level</ja:else><ja:if test="${pageType}" value="page"> <%= label.replaceAll(" ","-") %></ja:if>">
	<!--[if lt IE 9]><p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> to better experience this site.</p><![endif]-->
	<div id="mainbg">&nbsp;</div>
	<ja:if test="${hasWidgets}"><div id="widgetbg">&nbsp;</div></ja:if>
	<ja:if test="${pageType}" value="slide"> <%-- Slide page --%>
	
	</ja:if><ja:else> <%-- Index page or custom page --%>
	<div id="main" data-role="index"<ja:if test="${skipIndex}"> class="hidden"</ja:if>><div class="container">
	<ja:if test="<%= !util.makeSlides && pageType.equals("index") %>"><script><ja:if test="<%= !skipIndex || !slideshowAuto || folderCount > 0 || webLocationCount > 0 %>">if (window.location.hash && window.location.hash.length) </ja:if>document.getElementById('main').style['display']='none';</script></ja:if>
		
	<%-- Page header --%>
	<ja:if test="${splashVertical}"><div class="left"></ja:if>
	<header<ja:if not test="${headerType}" value="flatColor"> <ja:if test="${themeImageSame}">class="same"</ja:if><ja:else>style="background-image:url(${folderImageFileName});"</ja:else></ja:if>>
		<div class="pattern">
<%--	--%><ja:if not test="${splashVertical}"><ja:if test="<%= (logo != void && !util.isEmpty(logo)) || (showTopNavigation && !util.isEmpty(topNavigation)) %>"><ja:include page="top-navigation.inc" /></ja:if></ja:if>
				
			<%-- Page title area --%>
			<div class="title clearfix">
				<ja:if exists="uplink"><div class="upbtn"><div class="parent controls"><a href="${uplink}" <%--
				--%><ja:if test="${level}" not value="0">data-tooltip="#breadcrumb"</ja:if><ja:else><ja:if test="${pageType}" value="index">target="_parent"</ja:if> title="${uplinkText}"</ja:else>>&nbsp;</a></div></div></ja:if>
				<ja:if exists="breadcrumbPath"><div id="breadcrumb" class="hidden">${breadcrumbPath}</div></ja:if>
				<ja:if test="<%= searchOn || (pageHeader != void && !util.isEmpty(pageHeader)) || anyShares || anyZip %>"><aside><%--
					--%><ja:if exists="pageHeader"><div class="about controls"><a title="$text.aboutThisAlbum" data-tooltip>&nbsp;</a></div></ja:if><%--
					--%><ja:if test="${anyShares}"><ja:if test="${shareBoxType}" value="dropdown"><div class="share controls"><a>&nbsp;</a></div></ja:if></ja:if><%--
					--%><ja:if test="${anyZip}"><div class="download controls"><a href="${zipLink}" title="<ja:if test="${zipImages}" value="album">$text.downloadAlbum</ja:if><ja:else>$text.downloadImages</ja:else>" data-tooltip>&nbsp;</a></div></ja:if><%--
					--%><ja:if test="${useSearchForNew}"><div class="new controls"><a onclick="Search.start('@new:<%= (newDaysCount > 0)? newDaysCount : 30 %>');return false;" title="$text.searchNewImages" data-tooltip>&nbsp;</a></div></ja:if><%--
					--%><ja:if test="${useSearch}"><div class="search controls"><a data-tooltip="#searchinp">&nbsp;</a></div></ja:if><%--
				--%></aside></ja:if>
				<ja:if test="${useSearch}"><form id="searchinp" class="hidden"><input type="search" class="searchtext" placeholder="$text.searchBoxTip"><a class="button">&nbsp;</a></form></ja:if>
				<div class="hgroup">
					<h1>${_title}</h1>
					<ja:if test="<%= showBreadcrumbPath && !util.isEmpty(breadcrumbPath) %>"><div class="breadcrumb"><div class="cont"><%= breadcrumbPath.replaceAll("a><a", "a>&raquo;<a"); %></div></div></ja:if>
					<ja:if test="${pageType}" value="index"><ja:if exists="caption"><div class="description">${caption}</div></ja:if></ja:if>
				</div>
			</div>
		</div>
	</header>
		
	<%-- Vertically split layout --%> 
	<ja:if test="${splashVertical}">
		<div class="left-box"><div class="cont">
			<ja:if test="<%= mapOnIndex != void && mapOnIndex && locationCount > 0 %>"><div id="map"><div class="cont"></div></div></ja:if>
			<ja:if test="${facebookCommentsOn}"><div class="fb-comments" id="fb-comments" data-num-posts="${facebookCommentingPosts}" data-width="${folderImageWidth}" data-colorscheme="${likeBtnTheme}"<ja:if exists="pageUrl"> data-href="${pageUrl}"</ja:if>></div></ja:if>
			<ja:if test="${disqusCommentsOn}"><div class="disqus-comments" id="disqus-comments"><div id="disqus_thread"></div></div></ja:if>
		</div></div>
	</div>
	<div class="right">
		<ja:if test="<%= (logo != void && !util.isEmpty(logo)) || (showTopNavigation && !util.isEmpty(topNavigation)) %>"><div class="top-nav"><ja:include page="top-navigation.inc" /></div></ja:if>
	</ja:if> <%-- vertical -%>
		
		<%-- The page content in a scrollable container --%>
		<div class="items">
			<div class="cont load">
				<%-- User defined "above thumbs" code --%>
				<ja:if exists="thumbsHook"><%= engine.processTemplate((thumbsHookPreformat != void && thumbsHookPreformat)? util.formatPlainText(thumbsHook) : thumbsHook); %></ja:if>
				<ja:if test="<%= bulkActionsOn || (anyShares && shareBoxType != void && shareBoxType.equals("unboxed")) %>"><div class="actions clearfix">
					<ja:if test="${bulkActionsOn}"><div class="bulkactions">
					<ja:if test="${canSelectMultiple}"><span>$text.select <a id="selectall" href="javascript:void(0)">$text.all</a> <a id="selectnone" href="javascript:void(0)">$text.none</a></span></ja:if>
						<nav class="buttons">
							<ja:if exists="feedbackEmail"><a id="feedback" href="mailto:${authorEmail}" class="email-icon" data-tooltip title="$text.sendFeedbackThroughEmail">$text.sendFeedback</a></ja:if>
							<ja:if test="${shopOnIndex}"><ja:if test="${canSelectMultiple}"><a id="shopall" href="javascript:void(0)" class="shop-icon" data-tooltip title="$text.shopAllLabel">$text.shopBtn</a></ja:if></ja:if>
						</nav>
					</div></ja:if>
					<ja:if test="${anyShares}"><ja:if test="${shareBoxType}" value="unboxed"><div class="shareactions"></div></ja:if></ja:if>
				</div></ja:if>
				<ja:if test="${pageType}" value="page"><article class="<%= label.replaceAll(" ", "-") %>"></ja:if>
	</ja:else> <%-- Index or custom --%>