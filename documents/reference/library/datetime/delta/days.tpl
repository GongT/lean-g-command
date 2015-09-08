{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>days(a, b)</h2>
	计算两个日期 a & b 之间差多少天
	<span class="important">的绝对值</span>
	，向上取整
	<br/>
	a、b都是Date对象
	<br/>
	例如a是今天2点，b是今天3点，则 days(a,b) = 1
{/block}
