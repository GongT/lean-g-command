{include file="../../include/public-head.tpl"}

{include file="../../include/reference_menu.tpl"}

<h2>目的</h2>
加速文件系统访问
提供便捷的遍历方法，文件夹不存在不产生错误，忽略隐藏文件

<h2>概念</h2>
<h5>PATH</h5>
可以取值为 absolute、application、leang，分别相对于 根目录、程序目录（package.json所在目录）、加载器（loader）所在路径。通常用的只有application
<h5>回调</h5>
对于有回调的接口，回调函数的签名应为：<br/>
<code class="javascript">function (文件名去掉.js, 绝对路径, 相对请求位置的相对路径) { ... }</code><br/>
其中“请求位置”就是 <code class="var">PATH</code><br/>
两个路径都是带有完整文件名的<br/>

<h5>文件树对象</h5>
<code class="json">{
	folder:{
		folder2:{
			file1.js: "/home/app/folder/folder2/file1.js",
			file2.css: "/home/app/folder/folder2/file2.css"
		},
		index.html: "/home/app/folder/index.html"
	},
	file.txt: "/home/app/file.txt"
}</code>

<h2>API</h2>
<h3>read_<code class="var">[PATH]</code>_source_tree_foreach(String path, Function callback)</h3>
循环遍历目录 path 每一个 JS 文件 调用 callback

<h3>read_<code class="var">[PATH]</code>_source_foreach(String path)</h3>
读取目录 path 每一个 JS 文件 调用 callback（不遍历）

<h3>read_<code class="var">[PATH]</code>_source_tree(String path)</h3>
读取目录树，返回文件树对象

<h3>read_<code class="var">[PATH]</code>_dir_sync(String path)</h3>
类似 <code class="ref">fs.readdirSync</code> 但不包含隐藏文件

{include file="../../include/public-footer.tpl"}
