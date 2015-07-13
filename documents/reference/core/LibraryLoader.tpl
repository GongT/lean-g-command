{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h2>作用</h2>
“lazy load”
自动化模块加载，强制函数名与文件名统一

<h2>注意</h2>
定义模块时，<code class="var">module.parent</code> 永远等于 <code class="ref">LibraryLoader</code>，而不是首次使用它的父模块

<h2>使用方法</h2>
假如在应用根目录有个文件夹 test<br/>
文件 test/xxx/yyy.js 导出了一个函数。<br/>
自动加载器初始化时可以用<br/>
<code class="javascript">	var lib = new LibraryLoader();
	lib.autoload(FS.read_application_source_tree('test'));</code>
通过下面的代码即可调用这个函数<br/>
<code class="javascript">lib.xxx.yyy();</code>

<h2>API</h2>
<h3>autoload(Object data)</h3>
data 是 <code class="ref">FileSystem</code> 类 read_<code class="var">[Type]</code>_source_tree 的返回值。<br/>
自动加载指定目录的内容为模块库<br/>
可以重复调用，其为将后加载的树复制到已有的树上，覆盖所有已经存在的节点，并添加新节点。<br/>
例如 test 和 test1 目录下都有 abc.js，那么调用
<code class="javascript">	lib.autoload(FS.read_application_source_tree('test'))
	lib.autoload(FS.read_application_source_tree('test1'))</code>
后 <code class="var">lib.abc</code> 是定义在test1目录下的那个

<h3>extract()</h3>
立即加载所有在 autoload 中，但尚未载入的模块

{include file="../../include/public-footer.tpl"}
