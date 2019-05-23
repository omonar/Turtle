		<%-- Turtle gallery --%>
		var i=t.find('.thumbs');
		$('body').attr('id', 'index');
		<ja:if test="${showStartSlideshow}">$('body').removeClass('page').addClass('index');</ja:if>
		i.turtle({
			resPath:'${resPath}',relPath:'<%= util.escQuot(relPath) %>',<ja:if test="${level}" not value="0">level:${level},</ja:if><ja:if test="${skipIndex}">skipIndex:true,</ja:if>
			${jsGlobalVars}
			${jsIndexVars}
			${jsShopVars}
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

