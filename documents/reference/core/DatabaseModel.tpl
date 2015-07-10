{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h2>目的</h2>
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

# 内置扩展
静态：
* empty(String objectId)
包装
return AV.Object.createWithoutData(DatabaseName, objectId)

* getById(String objectId, Array includes)
包装
var q = new AV.Query(DatabaseName);
q.include(includes);
return q.get(objectId);

* getByUnique(String field, Any value, Array includes)
查询 field 字段等于 value 的第一个结果，如果没有这一行，则reject，类似get方法。
如果预期field=value的一行确实存在，则使用这个方法。例如查询指定订单信息，没有故意修改请求的用户总是能查到这个订单。
如果预期大部分时候不存在这一行，则不要用（性能差）。例如如果用户不存在则提示。

实例：
* trySave(Number retry)
调用save，如果失败，则再试 retry 次
retry不填默认=CONFIG.database.tryTimes=3次
每次失败都记录一个error

* afterSave(Function success, Function fail);
hook对象的save方法，如果成功，在调用then前先调用success或fail。
其中不能影响之后调用then的方式，通常此处可以记录日志。
每次afterSave后的第一次save有效，再次save不会再次调用success或fail

{include file="../../include/public-footer.tpl"}
