<script>
	{javascript}
	var _data = '';
	var fs = require('fs');
	var p = './documents/reference/library/';
	deep_foreach(p);
	$this.data = _data;
	
	function deep_foreach(dir){
		fs.readdirSync(dir).forEach(function (f){
			if(f === 'index.tpl'){
				return;
			}
			if(fs.lstatSync(dir + f).isDirectory()){
				_data += '<li class="disabled">' + f + '</li>';
				_data += '<li style="list-style:none">';
				_data += '<ul style="margin-bottom: 0">';
				deep_foreach(dir + f + '/');
				_data += '</ul>';
				_data += '</li>';
			} else{
				_data += '<li><a href="{$ABSURL}/reference/library/' + dir.replace(p, '') + f + '">' + f + '</li></a>';
			}
		});
	}
	{/javascript}
</script>

<ul id="menu" style="display:{$display};">
	{$data|replace:'.tpl':'.html'}
</ul>
