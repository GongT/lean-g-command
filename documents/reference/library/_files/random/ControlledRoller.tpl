<h2>ControlledRoller(parts)</h2>

随机函数生成器（虽然大写但这不是个类，不应该用new）
<br/>
例：
<code class="javascript">var fn = ControlledRoller({
	10: [50, 100],
	20: [10, 50],
	70: [0, 10],
});
var rand = fn();
</code>

运行nnn次后，rand有10%几率在50～100之间，20%几率在10～50之间，70%几率在0～10之间。
<br/>
每个区间内部几率相等
