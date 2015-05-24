/* 客户端用的云代码 */
AV.FS.read_cloud_source_tree_foreach('functions', function (module, abs, rel){
	var internal = rel.replace(/\/|\\/g, '_');
	var name = rel.replace(/\/|\\/g, '::');
	global.appLoaderLog += '\tcloud code：' + name + '\n';
	AV.Cloud.define(name, AV.Cloud[internal] = require(abs));
});

/* 调试用的云代码 */
if(AV.localhost){
	AV.FS.read_cloud_source_tree_foreach('functions-debug', function (module, abs, rel){
		var internal = '__' + rel.replace(/\/|\\/g, '_');
		var name = '__' + rel.replace(/\/|\\/g, '::');
		global.appLoaderLog += '\tdebug code：' + name + '\n';
		AV.Cloud.define(name, AV.Cloud[internal] = require(abs));
	});
}
