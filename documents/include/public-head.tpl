<!DOCTYPE html>
<html>

<head>
	<meta charset='utf-8'>
	<meta http-equiv="X-UA-Compatible" content="chrome=1">
	<meta name="description" content="Lean-g-command : the first leancloud framework">
	
	<link rel="stylesheet" type="text/css" media="screen" href="{$PUBURL}/stylesheets/stylesheet.css">
	<script type="text/javascript" src="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-2.1.4.min.js"></script>
	<title>the Leancloud framework G</title>
	
	<script type="text/javascript">
		var isWindows = navigator.appVersion.indexOf("Win") != -1;
		$(function (){
			$('body').addClass(isWindows? 'windows' : 'unix');
		});
	</script>
</head>

<body>
<!-- HEADER -->
<div id="header_wrap" class="outer">
	<header class="inner">
		<a id="homepage_banner" href="{$ABSURL}">首页</a>
		<script type="text/javascript">
			if(/index\.html$/.test(location.href) || /\/$/.test(location.href)){
				$('#menu_banner').attr('href', '..');
			}
			if(/\/doc\/$/.test(location.href)){
				$('#menu_banner').hide();
			}
		</script>
		<a id="menu_banner" href="{$index||'./index.html'}">目录</a>
		<a id="forkme_banner" href="https://github.com/GongT/lean-g-command">View on GitHub</a>
		
		<h1 id="project_title">the Leancloud framework G</h1>
		
		<h2 id="project_tagline"></h2>
	</header>
</div>

<!-- MAIN CONTENT -->
<div id="main_content_wrap" class="outer">
	<section id="main_content" class="inner">
