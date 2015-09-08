{include file="include/public-head.tpl"}

<h1>如何使用调试</h1>

<h2>Part 1: 控制台</h2>

<h5>直接运行脚本</h5>
<div>
	你可以将代码直接粘贴到控制台执行，由于控制台输入的东西不能保存，也不好修改，因此推荐只在控制台运行简单的命令。
</div>
<div>
	如果需要一些调试目的代码，可以写在main.js文件中，例如：
	<code class="javascript block">	global.test_function = function(){
		console.log("Hello World");
	}</code>
	然后就能在控制台通过 <code class="javascript">test_function()</code> 调用它
</div>
<div>
	不过，如果不是一次性的代码，推荐写到
	<a href="">测试云代码</a>
	中，可以随时方便的调用
</div>

<h5>异步请求</h5>
如果函数返回promise，想要查看promise的最终状态可能是件很麻烦的事，但在调试控制台中，你可以很方便的知道promise最终返回了什么。<br/>
例如下面的语句返回了一个Promise
<code class="javascript">(new AV.Query('_User')).first()</code>
你会看到如下输出
<div style="text-align: center;">
	<img src="{$PUBURL}/images/screenshot/repl.promise.png" alt="终端-异步请求"/>
</div>

<h5>控制台指令</h5>
<div class="part">
	<strong>.rs</strong>
	重新生成配置文件，然后重新启动调试
</div>
<div class="part">
	<strong>.exit</strong>
	退出调试（然而一般情况下都按两次Ctrl+C来退出）
</div>
<div class="part">
	<strong>.inspect</strong>
	生成代码补全文件，生成几个js文件，专门用于IDE的静态分析功能，用来支持高亮和代码提示
	<div class="image">
		<img src="{$PUBURL}/images/screenshot/inspect-b.png" alt="终端-生成代码提示前"/>
		<div>生成代码提示前</div>
	</div>
	<div class="image">
		<img src="{$PUBURL}/images/screenshot/inspect-a.png" alt="终端-生成代码提示后"/>
		<div>生成代码提示后</div>
	</div>
	<div class="muted">*你的IDE必须支持静态分析才能起作用，有的IDE需要手动刷新缓存</div>
</div>
<div class="part">
	<strong>.exit</strong>
	退出调试（然而一般情况下都按两次Ctrl+C来退出）
</div>
<div class="part">
	<strong>last & .last</strong>
	显示上一个控制台语句的结果（包括promise的结果）<br/>
	注意没有点的“last”实际是就是 <code class="var">global.last</code> 变量，在控制台输入语句并运行后，它们的返回值会自动赋值给
	<code class="var">global.last</code> 你可以通过 <code class="var">last.xxx</code> 引用它的属性，也可以用
	<code>var xxx = last</code> 保存这个值用于其他用途（last变量只能保存最后那个值，输入last.xxx在显示last.xxx的同时，会把last设为last.xxx）。
</div>
<div class="part">
	<strong>.help</strong>
	控制台指令的帮助
</div>

<h2>Part 2: web调试界面</h2>
服务启动后，可以用浏览器打开 /debugger 页面，进行一些调试（例如，默认情况下地址是 http://127.0.0.1:3000/debugger）

<div class="part">
	调试器可以使用一个数据库来增强其功能，你需要创建一个数据库，然后在配置文件“settings.json”中添加“debugDataBase”字段，值是这个数据库的名字。没有配置的情况下某些功能可能不能用。
	<ul>
		<li>
			<a href="./web_debugger/cloud_code.html">云代码</a>
		</li>
		<li>
			<a href="./web_debugger/express.html">控制器</a>
		</li>
		<li>
			<a href="./web_debugger/file.html">文件系统</a>
		</li>
		<li>
			<a href="./web_debugger/the_log.html">日志</a>
		</li>
	</ul>
</div>

<div class="part">
	调试器默认是开启的，如果需要在线上环境中禁用，需要在environment配置文件中添加“disableWebDebugger”并设为true<br/>
	通常建议还是开着，防止意外情况，但这时就需要一个强力的保护，防止有人利用调试工具进行破坏（毕竟调试工具的权限极高）<br/>
	请查看
	<a href="{$ABSURL}/starter/debug/web_debugger/require_login.html">这个页面</a>
	了解详情
</div>

{include file="include/public-footer.tpl"}
