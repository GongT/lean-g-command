<!DOCTYPE html>
<html>
<head>
	<title>{$_title}</title>
	<meta name="viewport" content="width=320,user-scalable=no">
	<meta name="format-detection" content="telephone=no">
	
	{insert_static plugin="bootstrap"}
	
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
<body>

<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
	<div class="container-fluid">
		<div class="navbar-header" style="cursor: pointer;">
			<button type="button" class="navbar-toggle collapsed btn-primary" data-toggle="collapse" data-target="#nav_bar">
				<span class="glyphicon glyphicon-send"></span>
			</button>
			<div id="CitySelectToggle" class="navbar-brand" onclick="$('#CitySelect').fadeToggle('fast')">
				<span>调试工具</span>
				<span class="city"></span>
			</div>
		</div>
		<div id="nav_bar" class="navbar-collapse collapse collapsed">
			<ul class="nav navbar-nav navbar-right">
				<li>
					<a href="{site_url '/avos/n'}">HOME</a>
				</li>
				<li>
					<a href="{site_url '/avos/n/cloudcode'}">云代码</a>
				</li>
				<li>
					<a href="{site_url '/avos/n/trigger'}">触发器</a>
				</li>
				{foreach $extraMenuList as $obj}
					<li>
						<a href="{site_url $obj.path}">{$obj.title}</a>
					</li>
				{/foreach}
			</ul>
		</div>
	</div>
</nav>
<div style="height:50px"></div>
