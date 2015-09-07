{include file="../../include/public-head.tpl"}

<h2>作用</h2>
引用配置文件信息，全局的CONFIG对象就是这个类型。<br>

它的内容就是生成的global.json中的内容，其中CONMFIG.lean就是settings.json中的内容<br/>

<div class="important">如果没有特殊需要，绝对不要修改它的内容</div>

<h2>API</h2>
<h3>load_application(String file)</h3>
从 config/application 中加载一个配置文件，并返回内容<br/>
这个文件夹中根据约定，只保存其它应用的id和key的信息

<h3>load_extra(String file)</h3>
从 config/extra 中加载一个配置文件，并返回内容<br/>
这个文件夹没有任何特殊作用，可以随意放置文件

{include file="../../include/public-footer.tpl"}
