<h2>arrayForEachSync(array, callback, thisArg)</h2>

遍历<code class="var">array</code>，每一个元素运行<code class="var">callback</code>
<br/>
但如果<code class="var">callback</code>返回了
<code>thenable</code>，则遍历暂停，等
<span class="important">成功或失败</span>后，再继续。
<br/><br/>

<span class="important">遍历过程中不要修改array，否则后果未知。</span>
<br/><br/>

<code class="var">callback</code>的<code class="var">this</code>指向<code class="var">thisArg</code>，如果没有传，则
<code>this=array</code>
