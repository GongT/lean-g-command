{include file="../../include/public-head.tpl"}

<h1>编写一个ExpressController</h1>

<section id="step1">
	<h2>第一步：确定你要访问的url</h2>
	例如：/user/list<br/>
</section>

<section id="step2">
	<h2>第二步：创建控制器文件</h2>
	<ol>
		<li>打开应用根目录</li>
		<li>打开express文件夹</li>
		<li>打开controllers文件夹</li>
		<li>创建文件夹“user”并打开</li>
		<li>创建文件夹“list”并打开</li>
		<li>创建文件index.js</li>
	</ol>
</section>

<section id="step3">
	<h2>第三步：编写基本结构</h2>
	
	首先是每个controller都一样的第一行：
	<code class="javascript">var ctl = module.exports = new ExpressController("用户列表");</code>
	当然，如果你不喜欢连续赋值，也完全可以写成两行。<br/>
	框架初始化时，ExpressController类已经赋值给global，所以可以直接使用。（别忘了 new）<br/>
	初始化时的参数是这个控制器的描述，用于调试和日志。<br/>
	框架自动require这个文件，然后根据返回的controller注册到express里，如果你忘了module.exports，就会发现明明没有异常，文件里的代码也运行了，但就是404。

</section>

<section id="step4">
	<h2>第四步：然后设置这个路由使用的http请求方法（这一步可以省略，默认是GET）</h2>
	
	<code class="javascript">ctl.method="GET";</code>
	还可以是 POST、PUT、HEAD 等等等等<br/>
	如果是post，通常还需要调用 ctl.accpet() 方法，文档见
	<a href="{$ABSURL}/starter/coding/upload.html">上传文件</a>

</section>

<section id="step5">
	<h2>第五步：接下来添加控制器所需的数据</h2>
	
	这个例子中，我们要显示所有用户数据，于是，我们需要先获取它们。
		<code class="javascript">	ctl.prepare("page").from("get", "page", "Int").els(function(){
		return 1;
	});
	ctl.prepare("userList").by(function(page){
		var q = new AV.Query('_User');
		q.descending("createdAt");
		q.limit(100);
		q.skip((<span class="important">this.page</span>-1)*100);
		
		return q.find();
	});</code>
</section>

<section id="step6">
	<h2>第六步：可以开始编写主函数了</h2>
	
	这次要写的主函数非常简单，只是显示一个模板文件。
	<code class="javascript">	ctl.next(function(rt){
		rt.assign("list", rt.userList);
		rt.assign("page", rt.page);
		rt.display("userlist.tpl");
	});</code>
	我们把之前准备好的数据“放（assign）”进模板，然后“显示（display）”一个模板文件
</section>

<section id="step7">
	<h2>第七步：确定之前写的东西没有出问题</h2>
	
	浏览器打开之前决定的url：/user/list<br/>
	本来这个地址不存在，会显示“非常抱歉，您查找的网页并不存在。”<br/>
	但现在，它变成了“非常抱歉，这个网页发生服务器错误。Failed to lookup view "userlist.tpl" in views directories ...（后面省略）”<br/>
	<br/>
	现在，按下键盘上的 X 键（手机双击屏幕下半部分空白处）<br/>
	内置的错误页面中全部打印了当前页面的相关信息（当然，这里有很多敏感信息，正式环境中可以选择
	<a href="{$ABSURL}/reference/config/error_page_extend.html">关闭</a>
	）。<br/>
	你可以在这些数据中找到“list”和“page”变量
</section>

<section id="step8">
	<h2>第八步：最后一步！编写模板</h2>
	所有用户模板均位于应用目录下的express/views文件夹中。<br/>
	现在我们在里面创建文件“userlist.tpl”<br/>
	实例模板内容：
	{literal}
		<code class="html">&lt;ul>
{foreach $list as $user}
	&lt;li>{$user.username}&lt;/li>
{/foreach}
&lt;/ul>
&lt;div>
	&lt;a href="?page={$page-1}">上一页&lt;a>
	&lt;a href="?page={$page+1}">下一页&lt;a>
&lt;/div></code>
	{/literal}
	这个模板非常简单，
	<span class="important">且极不标准</span>
	，如何编写标准html请参考w3s。<br/>
	而lean-g模板本身也有自己的标准，详情参考
	<a href="{$ABSURL}/reference/nsmarty/template.html">模板文档</a>
	<br/>
	实际上，smarty模板只是一个扩展，不会破坏express本身对模板的处理方式，因此你可以像其他express应用一样，使用ejs和jade。（但要记得依赖问题）
</section>

{include file="../../include/public-footer.tpl"}
