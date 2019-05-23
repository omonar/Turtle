<% 
	String outName = "author.jpg",
		defName = "author.png";
	String getAuthorImage(String aiPath) {
		File aif, df;
		AlbumImage ai;
		if (!util.isEmpty(aiPath) && outputDirectory != null &&
			(aif = new File(aiPath)) != null) {
			ai = new AlbumImage(aif, engine);
			if (ai != null) {
				ai = ai.scaleToFit(new Dimension(320,320));
				df = new File(outputDirectory, outName);					
				ai.saveImage(df);
				return outName;
			}
		}
		return resPath + "/" + defName;
	}		
	String authorImg = (authorImagePath == void)? (resPath + "/" + defName) : getAuthorImage(authorImagePath); 
%> 

