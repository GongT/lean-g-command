{include file="../../../include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>作用</h2>
提供输入输出

<h2>API</h2>
<h3>属性 session</h3>
session对象（具体用法参考session驱动的文档）

<h3>属性 scookie</h3>
签名cookie对象

<h3>属性 body</h3>
如果请求要求是PUT请求（设为ALL但实际请求用PUT无效）才存在<br/>
是请求体的Buffer

<h3>属性 files</h3>
如果请求是POST，且 accpet=multipart 才存在<br/>
是一个 <code class="ref">FilesHandler</code>

<h3>属性 get</h3>
一个 <code class="ref">InputChecker</code>，来源是get请求的参数

<h3>属性 post</h3>
一个 <code class="ref">InputChecker</code>，来源是post请求的参数<br/>
如果请求不是POST，访问它就会导致一个异常

<h3>属性 cookie</h3>
一个 <code class="ref">InputChecker</code>，来源是cookie数据

<h3>属性 header</h3>
一个数据对象，包含以下key：<br/>
<code>
	isXhr<br/>
	method<br/>
	ContentType<br/>
	Origin<br/>
	Referer<br/>
	UserAgent<br/>
	Host<br/>
	url<br/>
	remoteAddress
</code>

<h3>方法 pager(Number minCount, Number maxCount)</h3>
返回一个简单的对象，可选参数min、max分别指定每一页的最大最小项目数（count的上下界）<br/>
它从get参数获取“cursor”、“count”，（如果get参数没有这两个，默认分别为 0 和 minCount）<br/>
返回的对象包含以下属性：<br/>
&nbsp;&nbsp;&nbsp;&nbsp;<code class="var">cursor</code> 当前分页指针<br/>
&nbsp;&nbsp;&nbsp;&nbsp;<code class="var">count</code> 每页数量<br/>
&nbsp;&nbsp;&nbsp;&nbsp;方法 <code class="inlinejs">apply(AV.Query q)</code> 根据当前 cursor 和 count 设置 limit和skip<br/>
&nbsp;&nbsp;&nbsp;&nbsp;方法
<code class="inlinejs">assign(Object data)</code> 设置 data.cursor 和 data.count 为当前 cursor和count<br/>

{include file="../../../include/public-footer.tpl"}
