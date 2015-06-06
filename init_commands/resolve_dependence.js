console.log('Lean-G: resolve dependence -> run npm install');
var require_missing = CORE.debug.require_missing;

var deps = global.deploySettings.readDependenceList(true);

var oklist = [], faillist = {};
Object.keys(deps).forEach(function (name){
	try{
		require(name);
		oklist.push(name);
	} catch(e){
		// var missings = require_missing.parse_require_error_stack(e.stack);
		
		// if(missings.length <= 1){
		faillist[name] = deps[name];
		// }
	}
});

global.PackageJson = {
	dependencies: faillist,
	description : PackageJson.description,
	repository  : PackageJson.repository,
	README      : PackageJson.README,
	license     : PackageJson.license
};
global.deploySettings.commit();

var flst = Object.keys(faillist);
console.log('\x1B[38;5;10m正常模块%s个：%s\x1B[0m', oklist.length, oklist.join(', '));
console.log('\x1B[38;5;9m错误模块%s个：%s\x1B[0m', flst.length, flst.join(', '));

if(!flst.length){
	console.log('\x1B[38;5;10mNothing To Do\x1B[0m');
} else{
	var args = flst.map(function (name){
		return name + '@' + faillist[name];
	});
	args.unshift('install');
	var ret = LeanFork.external_sync('npm', args);
	
	if(ret == 0){
		console.log('\x1B[38;5;10mnpm install 返回了 %s.\x1B[0m', ret);
	} else{
		console.log('\x1B[38;5;9mnpm install 返回了 %s.\x1B[0m', ret);
	}
}
