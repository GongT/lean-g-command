{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>assignPath(obj, path, data)</h2>
	按照名称设置对象的属性
	<code class="javascript block">{literal}var obj = {};
assignPath(obj, "a.b.c", {the:'value'});
console.log(obj);
{/literal}</code>
	输出:
	<code class="javascript">{literal}{
	a:{
		b:{
			c: {the:'value'}
		}
	}
}{/literal}</code>
{/block}
