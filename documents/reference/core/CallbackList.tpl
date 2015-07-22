{include file="../../include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>目的</h2>
<code class="ref">CallbackList</code> 是一个 统一异步与同步统一写法、拆分组合代码 的解决方案<br/>
简单来讲，是一个轻量级模块系统<br/>
<br/>
CallbackList的目的是将多个 函数、异步操作、Promise 统统包装成一个能够完成复杂任务的Promise对象<br/>
其中每个任务都要符合给定的协议（比如this、参数、返回值的要求）<br/>
进而可以将每个单独的简单任务 <strong>重复使用</strong>，<strong>任意组合</strong> 成为能够完成不同复杂任务的promise

<h2>概念</h2>
<h5>
	<span style="color:red;">任务</span>
	-
	<em>贯穿整个系统的关键概念</em>
</h5>
<code class="ref">CallbackList</code> 按顺序执行每一个回调，每一个回调中一般都做且只做一件事<br/>
为了区分普通回调函数，文档里把这个回调叫任务。

<h5>运行时对象</h5>
<code class="ref">CallbackList</code> 执行时，所有任务共享相同的this对象<br/>
为了方便，文档里这个 this 叫运行时

<h5>thenable</h5>
Promise对象<br/>
常见的有 <code class="ref">AV.Promse</code>、<code class="library">ES6-Promise</code>、<code class="library">promise模块</code>、
<code class="ref">jQuery.Deferred</code>。<br/>
它们的共同特点是：有一个then方法，它第一个参数是resolve-callback，第二个参数是reject-callback。

<h2>API
	<span class="muted">*两种流程的方法都是连贯操作方法</span>
</h2>

<h2>正常流程</h2>
<h3>next(Function cb)</h3>
向回调列表添加一个普通任务<br/>
cb函数可以返回：<br/>
<ol>
	<li><strong>thenable</strong>
		：下一个任务的参数是它的resolve后的值（有的库支持多个值，比如 <code class="ref">AV.Promise.when()</code>，于是下个任务的参数就有多个），如果被reject，则开始错误流程。
	</li>
	<li><strong>ApiError</strong>
		：进入错误流程
	</li>
	<li><strong>其他普通值</strong>
		：直接开始下一个任务，下一个任务的唯一参数就是这个返回值（除非返回了arguments对象，则下一个函数将使用arguments代表的多个参数）
	</li>
</ol>

<h3>check(Function cb)</h3>
向回调列表添加一个用于“检查”的特殊任务<br/>
check不能影响下一个任务的参数<br/>
cb函数可以返回：<br/>
<ol>
	<li><strong>false或ApiError</strong>
		：进入错误流程
	</li>
	<li><strong>true</strong>
		：则继续执行接下来的任务
	</li>
	<li><strong>thenable</strong>
		：如果它resolve，见 1↖。如果reject，则进入错误流程（reject的第一个参数如果是ApiError，则错误对象就是它，否则是 E_CHECK_FAIL）
	</li>
	<li><strong>其他值（包括没有返回值）</strong>
		：抛异常，你必须返回true或false，可以转换为true、false的对象也都不行
	</li>
</ol>

<h3>fork(Function cb)</h3>
向回调列表添加一个用于“分支”的特殊任务<br/>
fork不能影响下一个任务的参数<br/>
cb函数可以返回：<br/>
<ol>
	<li><strong>另一个CallbackList</strong>
		：这个list会以当前 arguments&amp;this 调用，且无视其返回值
	</li>
	<li><strong>不返回</strong>
		：直接执行接下来的任务
	</li>
	<li><strong>ApiError</strong>
		：进入错误流程
	</li>
</ol>
* 注意这个调用是同步的，即fork出的list执行完毕后才会继续执行接下来的任务。

<h2>错误流程
	<span class="muted">* 没有任何恢复运行的方法，一旦进入错误流程，就只能reject而不能恢复</span>
</h2>
<h3>on_error(Function cb)</h3>
只有next和check后才能调用这个方法，它处理上一个函数可能产生的错误<br/>
参数是错误对象，返回值作为reject的参数

<h3>thrown(ApiError e)</h3>
只有next和check后才能调用这个方法<br/>
无论它们出了什么错误，抛了什么异常，都用 e 对象进行reject。<br/>
只有在前一个方法极端的简单，以至于它能发生的错误可以预见，才用这个方法。否则on_error更合适。<br/>
本地调试时，原本的错误信息会被输出到控制台，线上环境将没有任何日志，可能应该手动添加一些日志。
<br/>
例：<br/>
<code class="javascript">	cl.check(function (order){
		return order.status === 0; // 如果 order.status != 0，则输出 “E_STATE_ERROR”
	}).thrown(ApiError.E_STATE_ERROR);
</code>

<h3>caught(Function cb)</h3>
全局处理函数<br/>
参数是错误对象，返回值作为reject的参数<br/>
注意：<br/>
<ul>
	<li>只有没被上面两个方法处理的错误才会调用这个函数</li>
	<li>一个 <code class="ref">CallbackList</code> 只能有一个全局处理函数</li>
	<li>只处理当前 <code class="ref">CallbackList</code> 的，不处理fork出的list内的</li>
</ul>

<h2>其他非流程方法</h2>
<h3>create_instance(Array argList, Object thisArg)</h3>
从第一个任务开始调用列表，并指定参数列表和this对象<br/>
thisArg可选，默认新建空对象 “{literal}{}{/literal}”<br/>
还可以用 <code class="inlinejs">CallbackList.create_instance(CallbackList cbList, Array argList, Object thisArg);</code> 来调用
<br/>
返回一个Promise，用最后一个任务返回值resolve。

<h3>getFunction()</h3>
返回一个包装着 create_instance 的函数cb<br/>
cb被调用时，它的参数 arguments 作为 argList，它的 this 作为 thisArg，它会返回Promise

{include file="../../include/public-footer.tpl"}
