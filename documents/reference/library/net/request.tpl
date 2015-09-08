{extends 'include/library_struct.tpl'}

{block 'content'}
	<h2>request</h2>
	request 库的封装，返回AV.Promise
	<br/>
	<br/>
	如果请求成功，解析json内容为对象，其他结果返回字符串。
	<br/>
	如果请求失败，reject。
{/block}
