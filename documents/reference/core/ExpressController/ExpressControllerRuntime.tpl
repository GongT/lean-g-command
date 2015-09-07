{include file="../../../include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>作用</h2>
提供运行时对象<br/>
一定程度的纠错能力

<h2>API</h2>
<h3>属性 input</h3>
是一个 <code class="ref">InputHandler</code>

<h3>assign(String name, Any value)</h3>
在返回中添加 name，值为 value<br/>
如果 value 是个 <code class="ref">AV.Object</code> 或是它的数组，则会调用
<code class="inlinejs">avObj.toJSON()</code>。返回这个对象的内容<br/>
如果有Pointer类型的数据，它将被递归的转换为json。<br/>
如果遇到Date类型的数据，它会被转换成ISOString。（这不影响 assign('x', new Date) 这种用法）<br/>

<h3>assign(Object value)</h3>
把 value 和当前已有的返回值合并（extend）<br/>
因为合并过程通过 <code class="inlinejs">this.assign(name, value)</code> 所以也有序列化 <code class="ref">AV.Object</code> 的能力<br/>
如果 value 不是一个对象，或者是个数组，则会抛异常

<h3>display(String templateFileName)</h3>
渲染一个模板

<h3>displayError(ApiError e, String templateFileName)</h3>
渲染一个错误，如果是 ajax，则返回 json<br/>
在模板中，变量 error = 参数e<br/>
此前assign的值在模板中继续可用（ajax不会返回）<br/>
通常不传第二个参数，使用配置中指定的错误模板
<code class="javascript">	this.assign("a", 1);
	this.displayError(new Error("WOW"));
	// if in template, a=1 & error=Error("WOW").
	// if ajax, return { status:-1, message:"Error: WOW" }
</code>

<h3>属性 defaultError</h3>
只能get，返回默认的错误处理函数，它简单地调用displayError<br/>
通过将其传入Promise的reject-callback中实现简单错误处理

<h3>http(Number code)</h3>
设置http status值，默认200

<h3>debug_send(String|Buffer data, String contentType)</h3>
直接发送数据，并制定类型<br/>
如名字所说的，它应该用于调试，而不是任何正式接口

<h3>json()</h3>
输出 <code class="ref">assign</code> 的变量为 json，如果没有 <code class="ref">status</code>，则附加一个 status=0

<h3>next()</h3>
跳过当前 controller（于是就到了404处理器，显示一个“页面未找到”，当然，你也可以添加其他路由做其他事情）

<h3>redirect(String url, Number status)</h3>
重定向，status默认是302 - 临时重定向，也可以设置为 301 - 永久重定向<br/>
如果url是 http:// 、https:// 开头，则不特殊处理<br/>
否则转换为相对 <code class="var">CONFIG.BASE_URL</code> 的绝对路径（通过 <code class="ref">site_url()</code>）

<h3>setCookie(name, value, expire, path, domain, secure, httponly)</h3>
<p>
	设置cookie<br/>
	参考cookie相关信息<br/>
	只有name和value是必须的<br/>
	要注意的是 <code class="var">expire</code>：<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;如果 &lt; <code class="var">0</code>，则删除这个cookie<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;如果 === <code class="var">0</code>，则创建会话cookie<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;如果 &lt; <code class="var">1000</code>，则为保留天数<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;如果 &lt; <code class="var">9000000000</code>，则为到期unix时间戳（最大32位时间戳为
	<code class="var">2147483647</code>）<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;如果 &gt; <code class="var">9000000000</code>，则为到期java时间戳（毫秒）<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;如果是 <code class="var">Date</code>，则认为是准确的到期时间对象
</p>

<h3>setSecureCookie(name, value, expire, path, domain, secure, httponly)</h3>
同上，但设置的是签名cookie

{include file="../../../include/public-footer.tpl"}