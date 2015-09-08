{include file="include/public-head.tpl"}

<h1>NSmarty - 模板函数</h1>

<section>
	<h2>block和extends - 模板继承</h2>

</section>

<section>
	<h2>内置扩展</h2>
	
	<h3>函数</h3>
	<h4>capture</h4>
	<code class="block nsmarty">{literal}
this will be {capture name='cap1'}
	captured:
	{for $i=1 to 10}
		{$i}
	{/for}
{/capture} not capture.&lt;br/>&lt;br/>
{$smarty.capture.cap1}
{/literal}</code>
	
	输出结果：
	<code style="white-space:nowrap;display:block;">
	this will be{capture name='cap1'}
		captured:{for $i=1 to 10}
			{$i}
		{/for}
		{/capture}
	not capture.<br/><br/>
		{$smarty.capture.cap1}
	</code>
	
	<h3>过滤器</h3>
</section>

<section>
	<h2>编写扩展</h2>
</section>

{include file="include/public-footer.tpl"}
