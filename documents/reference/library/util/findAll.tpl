{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>findAll(query, once)</h2>
	返回一个Promise，循环找到query的所有结果后resolve，每次请求once个
{/block}
