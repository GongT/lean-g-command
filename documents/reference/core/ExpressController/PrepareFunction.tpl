{include file="../../../include/public-head.tpl"}

{include file="../../../include/reference_menu.tpl"}

<h2>作用</h2>
抽象通用的参数处理操作，减少重复劳动

<h2>概念</h2>
<h5>原始参数</h5>
用户输入的参数（与最终参数相比，它没有经过处理，所以称为原始的）

<h5>最终参数</h5>
通过这个类处理过的，可以直接使用的参数

<h2>API</h2>
<div style="font-style:italic;">所有方法都是连贯操作</div>
<h3>from(String where, String name, String Type)</h3>
<code class="var">where</code>：指定从哪里获取原始参数，可以选择：
<ul>
	<li>cookie</li>
	<li>scookie</li>
	<li>session</li>
	<li>path</li>
	<li>get</li>
	<li>post</li>
</ul>
<i style="font-style:italic">* 指定为path时，每个 <code class="ref">controller.prepare()</code> 之间的顺序决定它们在path中的位置</i>
<br/>

<code class="var">name</code>：原始参数的名字<br/>
<code class="var">Type</code>：原始参数的类型<br/>
当 where = session、scookie 时，Type 不起作用，这个方法相当于：<br/>
<code class="javascript">	return runtime.input[where][name];</code>
其他时候，这个方法相当于：<br/>
<code class="javascript">	return runtime.input[where]['require' + Type](name);</code>

<h3>by(Function cb)</h3>
处理原始参数的函数<br/>
cb函数的声明为：
<code class="javascript">	function (orignalInputValue){
		// "this" is runtime
	}
</code>
可以返回：
<ol>
	<li><code class="ref">ApiError</code>：中断处理，直接展示错误</li>
	<li><code class="var">thenable</code>：resolve的结果作为最终参数，如果reject则展示错误</li>
	<li><code class="">其他类型</code>：返回值作为最终参数</li>
</ol>

<h3>els(Function fn)</h3>
如果出错将被调用<br/>
可以返回一个值，作为“默认值”，用该值继续程序，而不是停止并提示“数据不存在”<br/>
* 注意这个“默认值”不能是 <code class="var">thenable</code> 或 <code class="red">ApiError</code> 等，它们都被认为是最终参数<br/>
或者显示一个自定义页面代替默认的“数据不存在”（此时不应该return任何东西）<br/>
<br/>
但不可以既不显示页面又不返回数据，这样会挂起请求。<br/>
也不可以在这个函数中使用异步操作（会导致不可控的问题）。

<h3>process(Function fn)</h3>
最终参数产生后，可以通过fn函数再次过滤<br/>
<b>它</b>的参数是之前通过by获得的最终参数（对els产生的无效）<br/>
返回值作为最终参数

<h2>例：</h2>
<code class="javascript">handler.prepare("userName")
	.from("get", "userId", "objectId")
	.by(CLS.User.getById)
	.process(function(user){
		return user.get("username");
	}).els(function(){
		this.redirect('/login?location=' + this.input.header.url);
	});
	
handler.main = function(rt){
	// rt.userName = the user's username field
};
</code>

{include file="../../../include/public-footer.tpl"}
