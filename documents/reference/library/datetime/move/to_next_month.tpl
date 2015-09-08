{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>to_next_month(date)</h2>
	date.setMonth(date.getMonth() + 1);
{/block}
