{include file="../../include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>作用</h2>
实现远程过程调用

<h2>配置</h2>
<h5>port</h5>本地调试时运行的端口号
<h5>debugport</h5>如果目标服务器运行的是云引擎v1.0，则用 debugport 代替 port 参数
<h5>domain</h5>域名前缀（*.avosapps.com 中的*）。如果没有指定，则请求功能会禁用
<h5>id</h5>应用的 appId
<h5>key</h5>应用的 appKey
<h5>name</h5>用于调试的应用名称

<h2>API</h2>
<h3>构造函数(String configFileName)</h3>
从 {literal}/include/config/application/${configFileName}.json{/literal} 读取配置，然后初始化

<h3>构造函数(String config)</h3>
根据指定配置构造

<h3>run(String fnName, Object data)</h3>
运行云代码 fnName，传参数 data<br/>
返回 promise，如果目标云代码返回正确的值，且 <code class="var">status</code>==0，则resolve，否则reject

<h3>get(String path, Object params)</h3>
GET 请求远程路径，请求参数是 params<br/>
返回 promise

<h3>post(String path, Object params)</h3>
POST 请求远程路径，请求体是 params<br/>
params 可以是 Buffer，也可以是普通对象，普通对象序列化为 json 传输<br/>
返回promise

{include file="../../include/public-footer.tpl"}
