{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>parse(dateString)</h2>
	类似Date构造函数，但容错性稍高
	<br/>
	逻辑如下：
	<ul>
		<li>如果传入数字，且小于 9000000000 （这个数比32位整数最大值还大）则认为是unix时间戳</li>
		<li>如果传入数字，且大于 9000000000 则认为是java时间戳</li>
		<li>如果传入UTC时间（特点是以字符串 GMT 结尾）则直接用Date解析</li>
		<li>如果传入ISO时间（____ T ____ Z）则直接用Date解析</li>
		<li>如果传入日期和时间（xxxx-xx-xx xx:xx:xx）分别处理时间和日期</li>
		<li>如果传入时间（xx:xx:xx）日期设为今天</li>
		<li>如果传入日期（xxxx-xx-xx）时间设为 00:00:00</li>
	</ul>
	处理日期的方式：(大写字母的意思是自动补全为今天)
	<ul>
		<li>xx：YYYY-MM-xx</li>
		<li>xx-xx：YYYY-xx-xx</li>
		<li>xx-xx-xx：20xx-xx-xx</li>
		<li>其他：直接传给Date</li>
	</ul>
	处理时间的方式：
	<ul>
		<li>xx：xx:00:00</li>
		<li>xx:xx：xx:xx:00</li>
		<li>其他：直接传给Date</li>
	</ul>
	以上时间、日期的“xx”都可以只有一位，自动在前面补个0
	<br/>
	<br/>
	如果仍然无法解析出正确的日期，返回和Date()传入一个非法日期效果一样。
{/block}
