<h2>basename(file, ext);</h2>

从file中去掉目录，返回文件名，如果传了ext，则ext会被从返回值的末尾替换掉
<br>
例如:

<code class="block">basename("path/file.js") => file.js
basename("path/file.js",".js") => file
basename("path/file.php",".js") => file.php
basename("path/file_no_ext") => file_no_ext
basename("path/file.inc.json",".inc.json") => file
basename("path/file.inc.json","file.inc.json") => ""
basename("some/path/file.inc.json","path/file.inc.json") => "file.inc.json"
basename("..") => ..
basename(".") => .
</code>
