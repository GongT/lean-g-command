{include file="../../include/public-head.tpl"}

<h1>NSmarty - 基本语法</h1>

<section>
	<h2>基本语法</h2>
	
	<h4>注释</h4>
	<pre>{literal}{&#42; wow such a doge *}{/literal}</pre>
	
	<h4>输出变量、赋值</h4>
	<code class="nsmarty block">{literal}{$date='2112-09-03'}
今天是：{$date}！也可以写成：{$date|replace:'-':'/'}！{/literal}</code>
	输出结果：
	<code>{$date='2112-09-03'}今天是：{$date}！也可以写成：{$date|replace:'-':'/'}！</code>
	
	<h4>输出数组和对象（nsmarty不区分数组和对象，数字可以理解为数字索引的对象）</h4>
	<code class="nsmarty block">{literal}{$people=[name=> '八云紫']}
{$people.age=17}                 {&#42; 使用“点” 和 *}
{$people['gender']='少女'}       {&#42; 用中括号 （是一样的 但中括号里面可以有特殊字符，例如空格） *}
她是{$people.gender}{$people.name}，今年{$people['age']}岁。{/literal}</code>
	输出结果：
	<code title="不服憋着！">{$people = [name=> "八云紫", age => "17"]}{$people.gender = "少女"}她是{$people.gender}{$people.name}，今年{$people.age}岁。</code>
	
	<h4>分支</h4>
	<code class="nsmarty block">{literal}{$selectedPlayer=0}
{if $selectedPlayer eq 0}
你选了灵梦
{elseif $selectedPlayer eq 1}
你选了魔理沙
{elseif $selectedPlayer eq 2}
你选了冴月麟
{/if}{/literal}</code>
	输出结果：
	<code>{$selectedPlayer=0}{if $selectedPlayer eq 0}你选了灵梦{elseif $selectedPlayer eq 1}你选了魔理沙{elseif $selectedPlayer eq 2}你选了冴月麟{/if}</code>
	
	<h4>循环</h4>
	<h5>foreach</h5>
	<code class="nsmarty block">&lt;table style="width:100%;">&lt;tr>
		{literal}{$colors=[honoka=>'#D98545', eli=>'#FEF0B5',kotori=>'#C3A48A',umi=>'#7171A6',
			rin=>'#F08C6C',maki=>'#DD6467',nozomi=>'#685A8A',hanayo=>'#FBE48B',nico=>'#5B5B5B']}
			
			{foreach $colors as $name => $code}
			&lt;td style="background-color:{$code};">{$name}&lt;/td>
			{/foreach}{/literal}
	
								&lt;/tr>&lt;/table></code>
	输出结果：
	<table style="width:100%;">
		<tr>{$colors=[honoka=>'#D98545', eli=>'#FEF0B5',kotori=>'#C3A48A',umi=>'#7171A6',
			rin=>'#F08C6C',maki=>'#DD6467',nozomi=>'#685A8A',hanayo=>'#FBE48B',nico=>'#5B5B5B']}
			{foreach $colors as $name => $code}
				<td style="background-color:{$code};text-align:center;" {if $name eq 'umi'}title="我老婆"{/if}>{$name}</td>
			{/foreach}</tr>
	</table>
	
	<h5>for A to B</h5>
	<code class="nsmarty block">{literal}{$number=[1,2,3,4,5,6,7,8,'⑨']}
{for $i=0 to $number|count}
	{$i}: {$number[$i]}、
{/for}{/literal}</code>
	输出结果：
<code>{$number=[1,2,3,4,5,6,7,8,'⑨']}
	{for $i=0 to $number|count-1}
		{$i}: {$number[$i]}、
	{/for}</code>
	
	<div> ---</div> 
	<code class="nsmarty block">{literal}{for $i=0 to 10}
	{$i}、
{/for}{/literal}</code>
	输出结果：
	<code>{for $i=0 to 10}{$i}、{/for}</code>
	
	<div class="important">{literal}循环过程中可以用{break}和{continue}哦～{/literal}</div>
	
	<h4>过滤器</h4>
	
	<p>
		输出变量时使用过滤器：如上面的{literal}{$date|replace:'-':'/'}{/literal}<br/>
		完整的过滤器列表看下面的“内置扩展”
	</p>
	
	<p>
		有时需要连续使用同一个过滤器，可以使用setfilter：
	<code class="block nsmarty">{literal}{setfilter escape}
	1: {$foo}
	2: {$bar}
{/setfilter}{/literal}</code>
	</p>
	
	<h4>函数</h4>
	可以在模板中使用提前定义好的函数实现简单的逻辑:，函数的调用方式是：
	
	<code class="block nsmarty">{literal}{inline_function_name $var1 $var2 var_name=$var_value}{/literal}</code>
	<code class="block nsmarty">{literal}{block_function_name $var1 $var2 var_name=$var_value}
	bla bla...
	{/block_function_name}{/literal}</code>
	一个inline_function不可以用block_function的方式调用，下面的写法是错的（反之亦然）
	<code class="block nsmarty">{literal}{inline_function_name $params}{/inline_function_name}{/literal}</code>
	一个函数至少有一个参数，否则无法调用。
	<a href="###" title="因为调用函数会消耗资源，固定不变的内容总是有别的办法实现">为什么？</a>
	
	<h4>引用文件</h4>
<code class="block nsmarty">{literal}{include file="./file_in_same_folder.tpl"}
{include file="../file_in_parent_folder.tpl"}
{include file="/absolute/file/path/file.tpl"}
{include file="$var_path/file.tpl"}
{include file="relative/to/template/root/file.tpl"}{/literal}</code>
	以上是所有可能的引用文件的方式
	<ul>
		<li>由./或../开头：相对于写这一行的文件的路径</li>
		<li>由/开头：文件系统绝对路径</li>
		<li>其他开头：从模板目录中找</li>
	</ul>
	使用变量时，先展开变量内容，再根据上面的规则找到模板<br/>
	模板目录可以通过配置文件修改（不建议）
	
	<h4>字面值</h4>
	很多时候，尤其是写script标签的的时候，会需要用很多大括号，但不想它们被转义，那么可以使用字面值：
	
	<code class="block nsmarty">{literal}&lt;script type="text/javascript">&#123;literal}
var json = {Flandre:'Scarlet'};
&#123;/literal}&lt;/script>{/literal}</code>
</section>

{include file="../../include/public-footer.tpl"}
