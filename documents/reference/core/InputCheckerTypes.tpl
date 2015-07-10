{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h3>Anything</h3>
<p>
	任何json能表示的值
</p>

<h3>String</h3>
<p>
	字符串
</p>

<h3>Url</h3>
<p>
	字符串，允许以下形式的url<br/>
<ul>
	<li>以 http:// 或 https:// 开头，不包含任何空白字符</li>
	<li>以 / 开头，不包含任何空白字符</li>
	<li>以 tel: 或 mailto: 开头</li>
</ul>
</p>

<h3>JSONString</h3>
<p>
	允许传入一个json字符串，返回解析后的结果<br/>
	允许任何可以被 <code class="ref">JSON.parse</code> 接受的值
</p>

<h3>JSONDataObject</h3>
<p>
	传入一个json字符串，返回一个新的 <code class="ref">InputChecker</code>，它的params就是这个解析结果<br/>
	只允许对象json，数组、字面值都不接受
</p>

<h3>Int</h3>
<p>
	整数值（所有数字值都只接受十进制数字）
</p>

<h3>Number</h3>
<p>
	数字值
</p>

<h3>Money</h3>
<p>
	数字值，但只允许最多两位小数，且只能大于等于0
</p>

<h3>PhoneNumber</h3>
<p>
	数字值，长度必须是11位
</p>

<h3>Bool</h3>
<p>
	布尔值<br/>
	允许以下输入：<br/>
	布尔值 <code class="var">true</code>、<code class="var">false</code><br/>
	数字 <code>0、-1</code> 为 <code class="var">false</code> ，<code>1</code> 为 <code class="var">true</code><br/>
	字符串 <code>false、off、0、no</code> 为 <code class="var">false</code>，<code>true、on、1、yes</code> 为
	<code class="var">true</code>
</p>

<h3>Time</h3>
<p>
	时间戳，返回Date对象<br/>
	如果是整整数值，则当作unix时间戳（注意单位是秒），否则直接作为Date的构造参数传给Date对象<br/>
	设计api时，应一律使用时间戳
</p>

<h3>VariableDataObject</h3>
接受一个对象作为参数，且不接受数组。返回这个对象。<br/>
在get请求中，创建一个对象的方法是：<code>?obj[a]=1&obj[b]=2</code>

<h3>DataObject</h3>
接受一个对象作为参数，且不接受数组。返回一个新的 <code class="ref">InputChecker</code>，它的params是这个对象。<br/>

<h3>GeoObject</h3>
接受经纬度信息，返回 <code class="ref">AV.GeoPoint</code><br/>
可以输入一个字符串："<code>纬度, 经度</code>"<br/>
或一个对象 <code class="">{ longitude:纬度, latitude:经度 }</code>

{include file="../../include/public-footer.tpl"}
