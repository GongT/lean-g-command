{include file="./include/public-head.tpl"}

<h1>
	<a id="lean-g" class="anchor" href="#lean-g" aria-hidden="true">
	<span class="octicon octicon-link"></span>
	</a>
	LEAN-G
</h1>

<p>（大概是）第一个基于leancloud的应用开发框架！</p>

<p>主要用于曾经用PHP开发、会使用nodejs的程序猿快速在leancloud上开始一个项目。当然不会php也是没有问题的。</p>

<p>
	本框架提供以下功能：
</p>
<ul>
	<li>模块、配置自动加载</li>
	<li>数据库日志、多级日志</li>
	<li>云代码函数、express控制器的包装（功能更多，使用更简单）</li>
	<li>数据对象原型</li>
	<li>通用前端文件库</li>
	<li>smarty模板引擎</li>
	<li>可扩展调试页面（可调试云代码等）</li>
	<li>服务状态监视、请求响应时间统计（未完成）</li>
	<li>控制台调试工具、部署工具</li>
	<li>新应用目录结构生成器</li>
</ul>

<h2>文档</h2>

<p>
	<a href="{$ABSURL}/starter/zero.html">从零开始建立一个应用</a>
</p>

<p>
	<a href="{$ABSURL}/starter/index.html">入门指南</a>
</p>

<p>
	<a href="{$ABSURL}/reference/index.html">引用文档</a>
</p>

<p>
	<a href="{$ABSURL}/howto/debug.html" class="important">如何进行本地调试</a>
</p>

<p>
	<a href="{$ABSURL}/starter/faq.html" class="important">常见问题</a>
</p>

<p>
	<a href="{$ABSURL}/research/index.html" class="important">原理研究</a>
</p>

{include file="./include/public-footer.tpl"}