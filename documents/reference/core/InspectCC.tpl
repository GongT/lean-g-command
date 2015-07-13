{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h2>作用</h2>
创建代码补全文件，用于给IDE插件进行静态分析

<h2>警告</h2>
不要将这个类用作非开发目的，这个类型将会不断改变完善（也就是现在还非常不完善）

<h2>API</h2>
<h3>构造函数(String rootValueName, Object object)</h3>
分析对象 object，定义object本身的名字为 rootValueName

<h3>toString()</h3>
返回结果（字符串，你需要自己把它保存到文件里）

<h3>skip(RegExp skipPattern)</h3>
当对象属性的名称符合pattern时，跳过它

{include file="../../include/public-footer.tpl"}
