{include file="../include/public-head.tpl"}

<h1>手把手教你创建一个基于Lean-G的app</h1>

<ol>
	<li>
		<a href="#installNode">安装最新版node程序</a>
	</li>
	<li>
		<a href="#preparePackage">创建应用目录</a>
	</li>
	<li>
		<a href="#installLeanG">安装Lean-G</a>
	</li>
	<li>
		<a href="#leangInit">初始化应用</a>
	</li>
	<li>
		<a href="#startTest">启动测试</a>
	</li>
	<li>
		<a href="#editConfig">编辑配置文件</a>
	</li>
	<li>
		<a href="#alias">添加命令别名</a>
	</li>
</ol>
<section id="installNode">
	<h2>第一步：安装最新版node程序</h2>
	打开nodejs官方网站
	<a href="https://nodejs.org/download/" target="_blank">https://nodejs.org/download/</a>
	<br/>
	windows和mac点击相应installer下载并安装即可（不要改变安装位置，否则可能导致部分第三方程序无法运行）<br/>
	linux选择对应64位或32位可执行文件下载并解压到指定位置
</section>

<section id="preparePackage">
	<h2>第二步：初始化应用目录</h2>
	你可以在任何喜欢的地方创建一个空目录储存代码，这个目录的位置称为“APP_PATH”，或“应用目录”。文档中遇到这两个词，指代的就是这个目录。<br/>
	例如，在D盘新建文件夹，名为“MyApp”，之后把代码都保存在这个目录中。文档中的“应用目录”就是“D:\MyApp\”
</section>

<section id="installLeanG">
	<h2>第三步：安装Lean-G</h2>
	打开一个终端
	<a style="font-size:smaller" class="windows" href="{$ABSURL}/starter/terminal.html" target="_blank">怎么打开？</a>
	<br/>
	运行命令 <code class="shell"><span class="unix">sudo&nbsp;</span>npm install lean-g-command -g</code><br/>
	这一步时间会很长，请耐心等待。
	
	<div class="unix">
		<h4>（可选）使用命令行自动补全</h4>
		***没有写***
	</div>
</section>

<section id="leangInit">
	<h2>第四步：初始化应用</h2>
	将终端的当前目录切换到应用目录中
	<a style="font-size:smaller" class="windows" href="{$ABSURL}/starter/terminal.html" target="_blank">怎么做？</a>
	<br/>
	运行命令
	<code class="shell">leang init</code>
	<br/>
	首先会安装几个依赖模块，这一步可能比较慢。<br/>
	稍等一段时间，你将会看到一行提示：<code>[OK] app root struct init complete.</code>这说明初始化已经成功完成了。
	
	<div style="text-align: center;">
		<img src="{$PUBURL}/images/screenshot/init.png" alt="初始化应用"/>
	</div>
</section>

<section id="startTest">
	<h2>第五步：启动测试</h2>
	运行命令
	<code class="shell">leang debug production default</code>
	<br/>
	经过简单的初始化工作后，你将看到一个提示符，如图所示
	<div style="text-align: center;">
		<img src="{$PUBURL}/images/screenshot/startup.png" alt="启动测试"/>
	</div>
	按两次 Ctrl+C 退出调试
</section>

<section id="editConfig">
	<h2>第六步：编辑配置文件</h2>
	所有配置文件均位于应用目录内的 include/config 中<br/>
	<br/>
	配置文件分为 应用配置、环境配置、服务器配置、其他配置。<br/>
	上面测试的命令中 <code class="ref">production</code> 是一个环境配置文件，<code class="ref">default</code> 是一个服务器配置文件。<br/>
	这两个文件你都可以在配置文件目录里找到<br/>
	<br/>
	在第四步中，默认为你创建了几个环境和一个服务器配置文件，如果需要，可以添加任意多个配置，并随时使用指定配置文件启动。<br/>
	<br/>
	<h4>服务器配置 - 开始调试</h4>
	服务器配置文件 <code class="file">include/config/server/default.json</code> 中的应用 ID、KEY 必须修改才能开始开发，三个KEY都可以在
	<code>leancloud后台 - 设置 - 应用Key</code> 中获得<br/>
	
	<div style="text-align: center;">
		<img src="{$PUBURL}/images/screenshot/config.png" alt="服务器配置文件"/>
		<br/>
		<span class="muted">一个合格的服务器配置文件</span>
	</div>
	
	<h4>环境配置 - 开始部署</h4>
	app在服务器和本地运行，可以通过不同配置文件来区分。例如，本地运行时，需要更多的调试信息、域名是 127.0.0.1、支付密钥使用测试模式
	等等，其中调试信息和域名是每个人都会遇到的问题，因此Lean-G内置了这两者的支持。<br/>
	<br/>
	大部分设置已经自动为你设置好，不过你的应用的域名需要自己设置，因此环境配置文件 <code class="file">include/config/environment/production.json</code> 中的
	<code class="var">baseUrl</code> 变量需要修改为你的应用在公网访问的地址。
</section>

<section id="alias">
	<h2>第七步：添加命令别名</h2>
	每次调试都要输入 <code class="shell">leang debug production default</code> 启动？太麻烦了！<br/>
	<br/>
	可以通过 <code class="shell">leang alias</code> 创建命令别名<br/>
	<br/>
	运行 <code class="shell">leang alias start="debug production default"</code> 将刚才的命令映射到“start”，下次想要调试，只需要输入
	<code class="shell">leang start</code> 即可。<br/>
	当然 debug 经常要用， start 可能还是太长，因为别名只要求没有空格，所以你甚至可以用一个字母来创建别名。<br/>
	<br/>
	如果你忘了之前定义的别名，可以输入 <code class="shell">leang alias</code> 并回车查看。
</section>

<section id="success">
	<h2>恭喜，应用已经准备好，可以开始开发了</h2>
	
	继续阅读：
	<ul>
		<li>
			<a href="{$ABSURL}/reference/configfile.html">配置文件条目的详细解释</a>
		</li>
		<li>
			<a href="{$ABSURL}/howto/debug.html">如何进行本地调试</a>
		</li>
		<li>
			<a href="{$ABSURL}/reference/index.html">引用文档</a>
		</li>
		<li>
			<a href="{$ABSURL}/starter/faq.html">常见问题</a>
		</li>
		<li>
			<a href="{$ABSURL}">返回首页</a>
		</li>
	</ul>
</section>

{include file="../include/public-footer.tpl"}