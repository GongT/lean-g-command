{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>queryForEachSync(query, once, cb)</h2>
	循环query，每次请求once个结果，【挨个】对每一个结果调用cb
	<br/>
	如果cb返回了thenable，则等它结束（不论成功还是失败），再用下一个结果调用cb
	<br/>
	这次的once个结果都调用过cb后，才开始一轮请求
	<br/>
	<br/>
	返回Promise，所有数据都遍历过，并都调用了cb并结束后，resolve
{/block}
