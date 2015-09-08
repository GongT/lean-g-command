{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>escapeRegExp(a, b)</h2>
	正则转义

{literal}
	<code class="javascript">module.exports = function (str){
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};</code>
{/literal}
{/block}
