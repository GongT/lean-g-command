{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h2>作用</h2>
创建代码补全文件，用于给IDE插件进行静态分析

<h2>警告</h2>
不要将这个类用作非开发目的，这个类型将会不断改变完善（也就是现在还非常不完善）

<h2>API</h2>
<h3>parse_error_stack(String stack)</h3>
根据一个 Error.stack 分析缺少的模块信息，通常它的结果用于 <code class="ref">recommand_solutions</code>

<h3>recommand_solutions(Array parsedStack)</h3>
根据缺少的模块信息，输出友善的解决方法

<h3>default_error_handler(Error e, Function printer)</h3>
分析错误堆栈，如果是因为缺少模块，则调用前面的函数输出解决方法。否则直接输出。<br/>
默认printer=console.error，如果想用其他输出函数，记得提前bind this

{include file="../../include/public-footer.tpl"}
