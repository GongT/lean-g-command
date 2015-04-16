/**
 * @title: 部署当前代码到测试环境
 */
var avosrun = require('../avrun.js');

avosrun('app').then(function (){
	// require('../deploy_helper/modify_package');
	return avosrun('deploy');
}).then(null, function (){
	console.log.apply(console.log, arguments);
});
