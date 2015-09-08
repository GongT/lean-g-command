{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>findEachChunk(query, once, cb)</h2>
	循环query，每一段数据(once个)调用一次cb（参数是个list），然后释放内存
	<br/>
	cb如果返回thenable，则下次请求要等到它resolve或reject后
	<br/>
	<br/>
	findEachChunk返回一个Promise，所有数据都请求到，并都调用过cb后resolve，不会reject。
	<br/>
	如果一个结果都没有，cb一次也不会调用到
{/block}
