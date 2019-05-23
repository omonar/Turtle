			<%-- Top navigation --%>
			<div id="navigation" class="clearfix">
				<ja:if exists="logo"><div class="logo">
				<ja:if test="${level}" not value="0"><a href="${rootPath}/${indexName}" title="$text.backToHome"><img src="${resPath}/${logo}" alt="${albumName}"></a></ja:if>
				<ja:else><ja:if exists="uplink"><a href="${uplink}" title="${uplinkText}" target="_parent" data-tooltip><img src="${resPath}/${logo}"></a></ja:if>
				<ja:else><img src="${resPath}/${logo}"></ja:else></ja:else>
				</div></ja:if>
				<%-- Main menu --%>
				<nav>${topNavigation}</nav>
			</div>

