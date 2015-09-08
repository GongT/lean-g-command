{include file="include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>目的</h2>
为 <code class="library">express</code> 的controller提供极丰富的输入输出功能，错误处理机制和类似传统mcv的调用方式。<br/>
值得注意的是，一旦使用ExpressController，就几乎无法实现RESTful
 
<h2>概念</h2>
<h5>默认位置</h5>
<code class="file">express/controllers</code> 里存放的文件，内部除了 require 外还做了其他操作。
展示错误：如果是普通请求，则渲染配置中指定的模板，如果是ajax，则返回json，其status != 0。

<h2>API</h2>
<h3>构造函数(String title)</h3>
title是用于调试的名称
同时使 controller.log = runtime.logger = new Logger(title)

<h3>属性 method</h3>
可以设为 GET、POST、PUT、DELETE 等，也不完善的支持ALL。
从这个属性读取的时候，返回总是大写。

<h3>accept(String type)</h3>
type是一种body-parser，内置的有 raw、urlencoded、json、multipart、text
也可以通过扩展ExpressController.bodyParsers来增加更多类型

<h3>属性 main</h3>
设置一个函数，这个函数就是controller的主函数。
它被调用时，this和第一个参数都是 runtime 对象

<h3>next(Function cb)</h3>
生成一个 CallbackList
使 this.main = cl.getFunction();
调用 cl.next(cb)
然后返回这个 cl
* 注意 ExpressController不是 CallbackList 派生的，这个“next”只是为了好看，它与 CallbackList 的 next 没有关系。因此不能这样：
controller.next(do_first_thing);
controller.next(do_second_thing);
只能这样：
controller.next(do_first_thing).next(do_second_thing);

<h3>prepare(String runtimeVarName)</h3>
创建一个 PrepareFunction 并返回，这个 PrepareFunction 的结果被存储在 runtime[runtimeVarName] 中

<h3>route(String path, Object router)</h3>
将当前控制器注册到 router 的 path 路径中
实际就是调用 router[controller.METHOD](path, controller.main)，但不要这样做，因为里面还做了很多准备工作

{include file="include/public-footer.tpl"}
