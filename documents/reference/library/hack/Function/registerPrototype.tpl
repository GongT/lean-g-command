{extends 'include/library_struct.tpl'}

{block 'content'}
	module.exports = function (){
	require('util')._extend(Function.prototype, CORE.Library.hack.Function);
	};
{/block}
