/**
 * @title: 部署当前代码到测试和发布环境
 * @windowTitle: 部署
 */
var fs = require('fs');

if(APP_CONFIG.blockDeploy){
	console.error('\x1B[38;5;14m%s\x1B[0m不允许部署，它可能仅用于本地调试。', APP_CONFIG.applicationName);
	process.exit(9);
}

/*
global.deploySettings.ensureDependence(false);
if(!global.deploySettings.checkUnusedDependence()){
	process.exit(9);
}
*/

require('lean-g-loader').createServerConfig();

LeanFork.promise('app').then(function (){
	return do_upload();
}).then(function (){
	return do_publish();
}).then(function (){
	console.log('\x1B[38;5;10m部署操作非常成功的完成了！！！\x1B[0m');
}, function (code){
	console.log('\x1B[38;5;10m不知道有没有成功，请参考后台日志（avoscloud deploy 返回值是 %s ）\x1B[0m', code);
});

function do_upload(){
	return LeanFork.promise('deploy');
}
function do_publish(){
	return new Promise(function (resolve, reject){
		setTimeout(function (){
			return LeanFork.promise('publish').then(resolve, reject);
		}, 3000);
	});
}
