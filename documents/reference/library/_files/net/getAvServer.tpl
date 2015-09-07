<h2>getAvServer(serverName)</h2>

通过读取
<code class="path">include/config/application/&lt;serverName>.json</code>
初始化一个
<a href={$ABSURL}/reference/core/ServerCloud.html>ServerCloud</a>
对象，并进行缓存

<br/><br/>
也可通过<code class="var">getAvServer.&lt;serverName></code>使用（推荐，避免了一次函数调用）
