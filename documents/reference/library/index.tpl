{include file="include/public-head.tpl" index="../index.html"}

<script>
	$(function (){
		var q = /page=(.*)/.exec(location.search);
		if(q){
			var p = q[1];
			
			$('#content').load('./_files/' + p);
			$('#menu').hide();
			$('#show_menu').show();
		} else{
			$('#show_menu').hide();
			$('#menu').show();
		}
	});
	function menu(){
		$('#content').hide();
		$('#show_menu').hide();
		$('#menu').show();
	}
</script>

{include file='include/library_menu.tpl' display='block'}

<div id="show_menu" style="display:none;">
	<a onclick="menu()" href="###">&lt;目录</a>
</div>
<div id="content"></div>

{include file="include/public-footer.tpl"}
