{include file="include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>作用</h2>
作为数据库访问对象的简单封装，使数据库操作可以和CallbackList配合起来。<br/>
并拆分文件。

<h2>自动加载</h2>
数据模型保存在<code class="file">/include/database</code><br>
每个文件夹的名字作为第一个参数、路径作为第二个参数 调用构造函数。<br/>
其中“_proto_”文件夹作为“基类”扩展到每一个模型中。（类似prototype的机制）<br/>
<br/>
例如数据库User的模型保存在<code class="file">/include/database/User</code>中<br/>
这个目录中有：<br/>
一个文件 <code class="file">User.js</code> ，作为常量文件，导出将被合并到类型中。<br/>
一个文件夹 <code class="file">static</code>，里面每个文件导出一个函数，作为静态成员<br/>
一个文件夹 <code class="file">property</code>，里面每个文件导出一个函数，作为类成员

<h2>API</h2>
<h3>构造函数(String databaseName, String definePath)</h3>
通常不需要自己构造。<br/>
databaseName是数据库名，同时也是模型名称，内置库不要加开头的下划线。<br/>
definePath是符合文件结构的路径。<br/>
<br/>
构造过程分为以下几步
<ol>
	<li>调用 AV.Object.extend 创建类 mdl。</li>
	<li>将 _proto_ 的 static 和 property 分别扩展到当前模型的 static 和 property （如果重名，则跳过）</li>
	<li>将 static 和 property 赋值给 mdl 和 mdl.prototype。</li>
	<li>绑定 static 方法的 this 为 mdl。这使得 cl.next(CLS.XXX.GetById) 成为可能。</li>
</ol>

{include file="include/public-footer.tpl"}
