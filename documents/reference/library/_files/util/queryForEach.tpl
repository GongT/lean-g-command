<h2>queryForEach(query, once, cb)</h2>

循环query，每次请求once个结果，【同时】对每一个结果调用cb<br/>
如果cb返回了thenable，则等所有的thenable都结束（不论成功还是失败），再继续请求<br/>

<br/>
返回Promise，所有数据都遍历过，并都调用了cb并结束后，resolve
