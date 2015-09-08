{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>pager_apply(chk, query, minPerPage, maxPerPage)</h2>
	从chk获取分页信息（cursor和count变量），并设置到query的skip和limit
{/block}
