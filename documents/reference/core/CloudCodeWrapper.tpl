{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h2>作用</h2>
LeanCloud云代码的包装，包含一些额外操作，例如错误处理、请求返回的包装。<br/>
它派生于 <code class="ref">CallbackList</code>

<h2>概念</h2>
<h5>默认位置</h5>
<code>APP_PATH/cloud/functions</code>，这个类型只在初始化时使用，而初始化过程就是依次读取这个目录中每个文件的过程。

<h2>实现</h2>
当初始化完成后，系统自动通过 <code class="ref">freeze()</code> 方法进行“冻结”，以准备好被调用。<br/>
初始化和冻结时，分别在任务列表前后插入一个任务。<br/>
第一个任务的作用是将输入转换成一个 <code class="ref">InputChecker</code>
最后一个任务的作用是返回数据给客户端。<br/>
<br/>
在返回任务现在的实现中，允许两种返回方式：<br/>
<ul>
	<li>最后一个自定义任务返回一个对象</li>
	<li>调用 <code class="ref">CloudCodeRuntime</code>（即this）的 <code class="ref">assign</code> 方法</li>
</ul>
如果两者都存在，则 返回对象 会被合并到 assign 对象中，然后再输出。这样效率不高，推荐只用其中一种。<br/>
不论返回值是什么，只要没有status字段，都会添加一个 status=0 到结果中。<br/>
<br/>

<h2>API</h2>
<h3>构造函数(String name, CallbackList thisArg)</h3>
<code>name</code>：立即调用 <code class="ref">setName()</code> 确定这个云代码的名字<br/>
<code>thisArg</code>：可选，可以用一个 <code class="ref">CallbackList</code> 对象代替 <code class="var">this</code>

<h3>setTitle(String title)</h3>
内部函数，自动调用。<br/>
设置云代码的名字，用于日志<br/>
title=云代码的名字（<code class="ref">AV.Cloud.define</code>的第一个参数）

<h3>setName(String name)</h3>
用于调试，指示这个云代码是做什么的，它会出现在日志中。<br/>
一般通过构造函数的第一个参数调用

<h3>freeze()</h3>
内部函数，自动调用。
“冻结”这个 <code class="ref">CloudCodeWrapper</code>，它不再拥有继承自
<code class="ref">CallbackList</code>的方法。也就是不能再向其中添加新任务。此时这个 <code class="ref">CloudCodeWrapper</code> 才可以注册给
<code class="ref">AV.Cloud.define</code>。<br/>

<h3>runner(Request req, Response rsp)</h3>
这个对象的主要处理函数<br/>
参数要求 “云代码” 的request和response对象（不能是express的）<br/>
这个方法将成为 <code class="ref">AV.Cloud.define</code> 的第二个参数

<h3>call(Object params)</h3>
手动调用这个云代码<br/>
返回Promise，用云代码的结果resolve（或错误reject）<br/>
可以通过它调用当前项目自身的云代码函数而不必产生没必要的http请求

{include file="../../include/public-footer.tpl"}
