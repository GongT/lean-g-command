{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>to_tomorrow(date)</h2>
	date.setDate(date.getDate() + 1);
{/block}
