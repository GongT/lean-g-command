/**
 * @title: 部署当前代码到测试环境
 * @title: 部署测试环境
 */
var avosrun = require('../avrun');

if(APP_CONFIG.blockDeploy){
	console.error('\x1B[38;5;14m%s\x1B[0m不允许部署，它可能仅用于本地调试。', APP_CONFIG.applicationName);
	process.exit(9);
}

var watch = require('../deploy_helper/wait_success_logs');

avosrun('app').then(function (){
	require('../deploy_helper/modify_package');
	return avosrun('deploy');
}).then(null, function (){
	console.log.apply(console.log, arguments);
});
