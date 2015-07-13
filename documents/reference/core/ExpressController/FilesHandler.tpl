{include file="../../../include/public-head.tpl"}

{include file="../../../include/reference_menu.tpl"}

<h2>API</h2>
<h3>requireBuffer、optionalBuffer(String fileFieldName)</h3>
从请求中 <code class="html">&lt;input type=file name=fileFieldName&gt;</code> 中获取数据
返回一个Buffer

<h3>requireAvFile、optionalAvFile(String fileFieldName)</h3>
同上，返回一个 AV.File 对象

{include file="../../../include/public-footer.tpl"}
