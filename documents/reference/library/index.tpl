{include file="../../include/public-head.tpl"}

<script>
	{javascript}
	var _data = '';
	var fs = require('fs');
	var p = dirname + '/_files/';
	deep_foreach(p);
	$this.data = _data;
	
	function deep_foreach(dir){
		fs.readdirSync(dir).forEach(function (f){
			if(fs.lstatSync(dir + f).isDirectory()){
				_data += '<li class="disabled">' + f + '</li>';
				_data += '<li style="list-style:none">';
				_data += '<ul style="margin-bottom: 0">';
				deep_foreach(dir + f + '/');
				_data += '</ul>';
				_data += '</li>';
			} else{
				_data += '<li><a href="?page=' + dir.replace(p, '') + f + '">' + f + '</li></a>';
			}
		});
	}
	{/javascript}
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

<ul id="menu" style="display:none;">
	{$data|replace:'.tpl':'.html'}
</ul>

<div id="show_menu" style="display:none;">
	<a onclick="menu()" href="###">&lt;目录</a>
</div>
<div id="content"></div>

{include file="../../include/public-footer.tpl"}
