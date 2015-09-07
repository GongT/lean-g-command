{include file="../../include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>作用</h2>
包装日志对象<br/>
提供多个日志级别，可以分别管理、开关<br/>
本地调试、线上调试、线上发布环境下分别执行不同行为<br/>
记录日志到数据库、远程目标、或log4n等（还没写好）

<h2>支持级别</h2>
<table>
	<thead>
	<tr>
		<th>调用接口</th>
		<th>提示文本</th>
		<th>颜色</th>
	</tr>
	</thead>
	<tbody>
	<tr>
		<td>print</td>
		<td>ECHO</td>
		<td>亮蓝</td>
	</tr>
	<tr>
		<td>debug</td>
		<td>DEBUG</td>
		<td>亮白</td>
	</tr>
	<tr>
		<td>info</td>
		<td>INFO</td>
		<td>亮蓝</td>
	</tr>
	<tr>
		<td>log</td>
		<td>LOG</td>
		<td>默认白</td>
	</tr>
	<tr>
		<td>success</td>
		<td>SUCCESS</td>
		<td>亮绿</td>
	</tr>
	<tr>
		<td>warn</td>
		<td>WARN</td>
		<td>棕黄</td>
	</tr>
	<tr>
		<td>error</td>
		<td>ERROR</td>
		<td>红+闪烁</td>
	</tr>
	<tr>
		<td>trace</td>
		<td>TRACE</td>
		<td>黄</td>
	</tr>
	</tbody>
</table>
<p>
	其中 debug 级别不会在 正式环境（<code>CONFIG.IS_DEBUG_ENV = CONFIG.IS_TEST_ENV = false</code>）时显示（无论设置了什么日志目标）
</p>

<h2>配置</h2>
<code class="var">CONFIG.LogDatabaseName</code>
用于记录日志的数据库名，如果不设置，则输出到标准输出（然后显示在leancloud后台）<br/>
默认 trace、debug、info 不显示，但输出到数据库时，会记录 info 级别。

<h2>示例</h2>
<code class="javascript">"print,debug,info,log,success,warn,error,trace"
	.split(",")
	.forEach(function(level){
		this[level](
			'%s an object "%s" and an array [%s]!!!',
			level,
			{ hello: "world" },
			[1, 2, '3']
		);
	}, new Logger('测试'));
</code>
<img src="{$PUBURL}/images/screenshot/console-log.png" alt="screenshot of example"/>

<h2>对象序列化表</h2>
<table>
	<thead>
	<tr>
		<th>类型</th>
		<th>日志输出</th>
	</tr>
	</thead>
	<tbody>
	<tr>
		<td>ApiError</td>
		<td>它的 stringify() 返回值</td>
	</tr>
	<tr>
		<td>Error</td>
		<td>它的 stack</td>
	</tr>
	<tr>
		<td>函数</td>
		<td>“[Function: xxxx]”</td>
	</tr>
	<tr>
		<td>AV.Object</td>
		<td>它的 toJSON() 返回值进行 JSON.stringify</td>
	</tr>
	<tr>
		<td>AV.Query</td>
		<td>“[AV.Query: { 筛选条件 }]</td>
	</tr>
	<tr>
		<td>有 inspect方法 的对象</td>
		<td>它的 inspect() 返回值</td>
	</tr>
	<tr>
		<td>普通数据对象</td>
		<td>JSON.stringify()</td>
	</tr>
	<tr>
		<td>类实例对象</td>
		<td>JSON.stringify()
			<span style="color:red">* 将来会改变</span>
		</td>
	</tr>
	<tr>
		<td>null、undefined、NaN</td>
		<td>直接输出“null”、“undefined”、“NaN”</td>
	</tr>
	<tr>
		<td>其他普通内置类型如number、string</td>
		<td>直接输出它的值</td>
	</tr>
	</tbody>
</table>
<p>
	对象的序列化为依次进行，例如一个拥有 inspect方法 的 Error对象，按照第2条输出它的 stack，而不是调用它的 inspect 方法
</p>

<h2>API</h2>
<h3>构造函数(String message)</h3>
创建一个logger<br/>
message 必填，它是这个日志的第一部分，也是进行日志分析的重要筛选参数，一定要仔细确定。<br/>
切忌使用含糊不清、容易混淆的名字（例如上面的“测试”）。

{include file="../../include/public-footer.tpl"}