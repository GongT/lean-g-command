{include file="include/public-head.tpl"}

<h1>编写一个CloudCodeWrapper</h1>

<section id="step1">
	<h2>第一步：确定云代码的名字</h2>
	例如：user::GetInfomation<br/>
</section>

<section id="step2">
	<h2>第二步：创建云代码文件</h2>
	<ol>
		<li>打开应用根目录</li>
		<li>打开cloud文件夹</li>
		<li>创建文件夹“user”并打开</li>
		<li>创建文件List.js</li>
	</ol>
</section>

<section id="step3">
	<h2>第三步：编写基本结构</h2>
	
	首先是每个cloudcode都一样的第一行：
	<code class="javascript">var cc = module.exports = new CloudCodeWrapper("获取用户信息");</code>
	当然，如果你不喜欢连续赋值，也完全可以写成两行。<br/>
	框架初始化时，CloudCodeWrapper类已经赋值给global，所以可以直接使用。（别忘了 new）<br/>
	初始化时的参数是这个云代码的描述，用于调试和日志。<br/>
	框架自动require这个文件，然后根据返回的wrapper注册到AV.Cloud里，如果你忘了module.exports，就会发现明明没有异常，文件里的代码也运行了，但就是no function。

</section>

<section id="step4">
	<h2>第四步：处理请求</h2>
	
	无论如何，首先要得到请求的参数才能构造数据库请求。<br/>
	CloudCodeWrapper继承于CallbackList，它的第一个next函数的唯一参数就是请求的内容
	<code class="javascript">cc.next(function(chk){
	var uid = chk.requireObjectId("userId"); 
	return CLS.User.getById(uid, ["lastFeed"]);
});</code>
	首先获取客户端想要请求的用户id<br/>
	根据uid获取用户，顺便带上user的一个pointer字段“lastFeed”的内容<br/>
	
	接下来将这个用户信息进行返回：
<code class="javascript">cc.next(function(user){
	this.assign('user', {
		username: user.get('username'),
		age: user.get('age')
	});
	this.assign('lastFeed', user.get('lastFeed').toJSON());
});</code>
	这样客户端会收到一个json，包含status、lastFeed和user三个字段<br/>
	其中user只包含了username和age
	<br/>
	<br/>
	<span class="important">至此，这个云代码就已经写完了！</span>
</section>

<section>
	<h2>然而</h2>
	事情还没有结束，还要做错误处理
	<span style="color:#ffa7ac">（其实写代码过程中就应该注意）</span>
	
	例如getById失败会产生错误，它会通知你为什么错了，但这对用户很不友好，我们要替换它：
	<code class="javascript">cc.next(function(chk){
	var uid = chk.requireObjectId("userId"); 
	return CLS.User.getById(uid, ["lastFeed"]);
})<span class="important">.thrown(ApiError.E_USER_NOT_FOUND)</span>;</code>
	关于E_USER_NOT_FOUND从何而来，参考
	<a href="{$ABSURL}/starter/coding/error_code.html">如何定义错误码</a>
	<br/>
	当没有找到用户或数据库发生错误时，都会提示“用户没有找到（或者你定义的别的字符串）”，同时，日志里会记录到底发生了什么。
	<br/>
	<br/>
	如果用户没有lastFeed，执行<code>user.get('lastFeed').toJSON()</code>会抛出异常
	<br/>
	好在CallbackList对所有异常情况都做了处理，你的服务不会崩溃，也不会造成内存泄漏，客户端也不会因此挂起，而是收到一个错误提示，告诉他服务器内部异常。
	<br/>
	这种情况下体验也是很不好的，但thrown()方法无能为力，
	<span class="important">因为这是逻辑上的错误，而不是数据上的</span>
	。
	<br/>
	这种情况下使用thrown（或类似的on_error）不仅不能容错，反而容易以藏真实错误。只有非常简单、非常短的函数适合这种错误处理方式。
</section>

{include file="include/public-footer.tpl"}
