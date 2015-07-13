{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h2>作用</h2>
<p>
	统一所有用户级的错误信息，能被客户端轻松的使用。<br/>
	防止代码中使用魔数<br/>
	这些错误对象满足 <code>new ApiError instanceof Error</code>
</p>

<h2>自动生成</h2>
<p>
	通过解析 include/ErrorMessageDefine.json 文件，能自动生成错误对象。<br/>
	这个json文件需要定义一个数组，其每一项都是一个错误码定义，符合以下结构：<br/>
	<code>[错误码, 错误的名称, 错误提示信息]</code><br/>
	其中错误码可以省略，将自动生成不重复的错误码。错误码不能小于0，也不能重复。<br/>
	错误的名称必须以 <code>E_</code> 开头，允许大写英文字母、数字、下划线。<br/>
</p>

<p>
	系统内部存在内置错误码。包括E_SUCCESS，它的错误码总是等于0。<br/>
	以及其他内部错误，这些错误码总是小于0。<br/>
	<br/>
	所有这些错误都能通过 ApiError.E_NAME 访问<br/>
</p>

<h2>API</h2>
<p>
	<code>构造函数(String message, String name, String code)</code><br/>
	分别对应提示信息、名称、错误码<br/>
	创建错误不会将它注册到 <code class="ref">ApiError.E_NAME</code><br/>
</p>

<h3>toJSON()</h3>
<p>
	返回一个JS对象，它包含当前 <code class="ref">ApiError</code> 的全部信息
</p>

<h3>toStrongJSON()</h3>
<p>
	返回一个JS对象，它除了 <code class="ref">toJSON</code> 外，还会去掉所有循环引用
</p>

<h3>stringify()</h3>
<p>
	返回一个字符串，它是 <code class="ref">toStrongJSON</code> 的字符串版本
</p>

<h3>response(Response rsp)</h3>
<p>
	将当前错误对象以json的形式返回给客户端，<code class="var">rsp</code> 是 <code class="lib">express</code> 的
	<code class="var">response</code> 对象
</p>

<h3>data(Any data)</h3>
<p>
	根据当前对象复制并返回新的错误对象，并在新的对象中添加数据 <code class="var">data</code>，<code class="ref">toJSON</code> 时，会增加一个
	<code class="var">data</code> 属性。
</p>

<h3>attach(Object data)</h3>
<p>
	根据当前对象复制并返回新的错误对象，同时附加数据 <code class="var">data</code>，<code class="ref">toJSON</code> 时，会将
	<code class="var">data</code> 扩展到结果数据中。<br/>
	例如可以用 <code class="javascript">ApiError.E_SUCCESS.attach({ message: "重复操作" })</code> 来覆盖默认的 “操作成功”提示<br/>
	切勿覆盖 code 属性，将导致简单的问题变得非常难以捕捉。
</p>

<h3>is(ApiError object)</h3>
<p>
	判断两个错误是否相等，依据是 <code class="var">code</code> 是否相等，如果
	<code class="var">object</code> 不是一个<code class="ref">ApiError</code>，则返回
	<code class="lit">false</code>
</p>

{include file="../../include/public-footer.tpl"}
