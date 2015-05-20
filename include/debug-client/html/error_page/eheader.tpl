<!DOCTYPE html>
<html>
<head>
	<title>{$_title}</title>
	<meta name="viewport" content="width=320,user-scalable=no">
	<meta name="format-detection" content="telephone=no">
	
	{insert_static plugin="bs-style"}
	
	{$_head.pstyles|join:"\n\t"}
	{$_head.astyles|join:"\n\t"}
	
	<script type="text/javascript" crossorigin="anonymous">
		{template_constants}
		if(CONSTANT.CACHE_VERSION != localStorage.CACHE_VERSION){
			localStorage.clear();
			localStorage.CACHE_VERSION = CONSTANT.CACHE_VERSION;
		}
	</script>
	
	{$_head.pscripts|join:"\n\t"}
	{$_head.ascripts|join:"\n\t"}
</head>
<body class="{$_class}">
