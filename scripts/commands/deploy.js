/**
 * @title: 部署当前代码到测试和发布环境
 */
var avosrun = require('../avrun.js');
var fs = require('fs');

avosrun('app').then(function (){
	// require('../deploy_helper/modify_package');
	return avosrun('deploy');
}).then(function (){
	return avosrun('publish');
}).then(null, function (){
	console.log.apply(console.log, arguments);
});
