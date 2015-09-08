{include file="include/public-head.tpl" index="{$ABSURL}/reference/library/index.html"}

<script>
	function menu(){
		$('#content').hide();
		$('#show_menu').hide();
		$('#menu').show();
	}
</script>

{include file='include/library_menu.tpl' display='none'}

<div id="show_menu">
	<a onclick="menu()" href="###">&lt;目录</a>
</div>
<div id="content">{block 'content'}{/block}</div>

{include file="include/public-footer.tpl"}
