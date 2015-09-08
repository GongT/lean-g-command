{include file="include/public-head.tpl"}

<a href="{$ABSURL}/reference">返回</a>

<h2>静态方法</h2>
<h3>empty(String objectId)</h3>
<p>
	快捷方式：<br/>
	<code class="javascript">	return AV.Object.createWithoutData(DatabaseName, objectId)</code>
</p>

<h3>getById(String objectId, Array includes)</h3>
<p>
	快捷方式：<br/>
	<code class="javascript">	var q = new AV.Query(DatabaseName);
	q.include(includes);
	return q.get(objectId);</code>
</p>

<h3>getByUnique(String field, Any value, Array includes)</h3>
<p>
	查询 field 字段等于 value 的第一个结果，如果没有这一行，则reject，类似get方法。<br/>
	如果预期field=value的一行确实存在，则使用这个方法。例如查询指定订单信息，没有故意修改请求的用户总是能查到这个订单。<br/>
	如果预期大部分时候不存在这一行，则不要用（性能差）。例如如果用户不存在则提示。<br/>
</p>

<h3>firstByUnique(String field, Any value, Array includes)</h3>
<p>
	快捷方式：<br/>
	<code class="javascript">	var q = new AV.Query(DatabaseName);
	q.include(includes);
	q.equalTo(key, value);
	return q.first();</code>
</p>

<h2>实例方法</h2>
<h3>trySave(Number retry)</h3>
<p>
	调用save，如果失败，则再试 retry 次<br/>
	retry不填默认=CONFIG.database.tryTimes=3次<br/>
	不论最终成功与否，每次失败都在 console.error 记录一行<br/>
</p>

<h2>afterSave(Function success, Function fail)</h2>
<p>
	hook当前对象的save方法，如果成功，在调用then前先调用success（失败同理）。<br/>
	两个函数的行为不能影响之后调用then的方式：即then回调函数的结果不会因为用了afterSave而改变，但也没有办法强制它改变。<br/>
	但如果抛了异常，则then回调没有机会执行。<br/>
	通常作用是记录修改、更新日志。<br/>
	每次afterSave后的第一次save有效，再次save不会再次调用success或fail
</p>

{include file="include/public-footer.tpl"}
