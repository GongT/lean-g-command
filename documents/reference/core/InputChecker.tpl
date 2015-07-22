{include file="../../include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>作用</h2>
统一输入方式<br/>
检测输入是否有问题并给出一定的信息

<h2>API</h2>
<h3>构造函数(Object params)</h3>
用params初始化这个checker<br/>
params的引用被保存在checker内部，如果随后params被改变，则checker返回的结果也会改变

<h3>raw()</h3>
返回原始数据（即params）

<h3>get(String name, Any opt)</h3>
获取params[name]对应的数据，如果不存在则返回opt

<h3>has(String name)</h3>
判断params里是否存在name字段<br/>
<code class="var">null</code>、<code class="var">undefined</code>、<code class="var">空字符串</code>被认为是存在<br/>
params 没有这个key被认为是不存在<br/>

<h3>require<code class="var">[Type]</code>(name)</h3>
返回必须存在的字段name<br/>
如果不存在，或者类型不满足要求，都抛出 <code class="ref">InputCheckFailError</code> 异常，这是一个 <code class="ref">ApiError</code> 的实例<br/>
例如 <code class="javascript">params = { a:"abc" }</code>
<code class="javascript">checker.requireString("a") // 返回字符串"abc"</code>
而
<code class="javascript">checker.requireInt("a") // 抛出异常</code>

<h3>requireNullable<code class="var">[Type]</code>(name)</h3>
和 <code class="ref">require[Type]</code> 基本相同<br/>
不同的是，这个字段可以是空值（<code class="var">null</code>、<code class="var">undefined</code>）<br/>
这样可以强制传入一个参数，但该参数可以为空<br/>

例如：<br/>
<code class="ref">requireObjectId</code> 必须传入一个合法的 objectId<br/>
如果这个参数可以为空，那么有两种选择：<code class="ref">requireNullableObjectId</code> 和 <code class="ref">optionalObjectId</code><br/>
在api设计中，<code class="ref">optional</code>常常引起误会，最好的方法是传入一个特殊值“<code class="var">null</code>”<br/>
此时这个参数可以接受一个合法的 objectId 或 null，而非法的 objectId 就不能通过<br/>

<h3>require<code class="var">[Type]</code>Array(name)</h3>
返回必须存在的字段name数组<br/>
输入既可以是一个单个的数据，也可以是一个数组，但返回保证总是一个数组。<br/>
如果不存在，或者任意一项类型不满足要求，则抛出 <code class="ref">InputCheckFailError</code><br/>

例如：<br/>
<code class="javascript">	params = { a1:"test", a2:["test1","test2"] }
	checker.requireStringArray("a1") // return ["test"]
	checker.requireStringArray("a2") // return ["test1","test2"]</code>

<h3>optional<code class="var">[Type]</code>(name, defaultValue)<br/>
	optionalNullable<code class="var">[Type]</code>(name, defaultValue)<br/>
	optional<code class="var">[Type]</code>Array(name, defaultValue)</h3>
defaultValue是“默认值”，如果指定的值不存在，则取该值。其他行为与require一样。<br/>
有值但类型不满足仍然抛异常。注意空值也算有值。如
<code class="javascript">	params = { a:null }
	checker.optionalInt("a", 0) // 抛异常
</code><br/>
“默认值”参数没有类型要求

{include file="../../include/public-footer.tpl"}
