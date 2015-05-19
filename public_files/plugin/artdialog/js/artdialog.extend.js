function showModalDialog(href){
	if(art){
		art.dialog.open(href, {
			title : '正在加载………………',
			width : "90%",
			height: "100%",
			lock  : true,
			drag  : false
		});
	} else{
		dialog({
			title : '正在加载………………',
			width : "90%",
			height: "100%",
			drag  : false,
			url   : href
		}).showModal();
	}
}

function showModalImage(href){
	if(art){
		art.dialog.open('/ajax/showimage?href=' + encodeURIComponent(href), {
			title : '正在加载………………',
			width : "50px",
			height: "50px",
			lock  : false,
			drag  : true
		});
	} else{
		dialog({
			title : '正在加载………………',
			width : "90%",
			height: "100%",
			drag  : true,
			url   : '/ajax/showimage?href=' + encodeURIComponent(href)
		}).show();
	}
}
