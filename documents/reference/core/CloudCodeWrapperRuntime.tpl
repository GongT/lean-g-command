{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h2>目的</h2>
每个请求是在执行一个 <code class="ref">CallbackList</code>，因此都有一个this对象<br/>
云代码中this对象就是一个 <code class="ref">CloudCodeRuntime</code> 实例<br/>
它通过 <code class="ref">CloudCodeWrapper.call</code> 和 <code class="ref">CloudCodeWrapper.runner</code> 自动创建，没有手动创建的必要。

<h2>API</h2>
<h3>assign_status(Number status_code)</h3>
除了0以外的值都不推荐使用，推荐用ApiError代表错误。<br/>
如果云代码确实不返回数据，则可以通过 <code>assign_status(0)</code> 绕过“没有返回值”的检查

<h3>assign(String name, Any value)</h3>
在返回中添加 name，值为 value<br/>
如果value是个 <code class="ref">AV.Object</code> 或是它的数组，则会调用
<code>.toJSON()</code> 返回这个对象的内容，但这将丢失任何pointer类型的内容（只留下pointer的 objectId）。

<h3>assign(Object value)</h3>
把 value 和当前已有的返回值合并（extend）<br/>
因为合并过程通过 <code>this.assign(name, value)</code> 所以也有序列化 AV.Object 的能力<br/>
如果 value 不是一个对象，或者是个数组，则会抛异常

{include file="../../include/public-footer.tpl"}
