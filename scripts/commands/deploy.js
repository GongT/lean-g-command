/**
 * @title: 部署当前代码到测试和发布环境
 */
var avosrun = require('../avrun.js');
var fs = require('fs');
var Promise = require('promise');

if(APP_CONFIG.blockDeploy){
	console.error('\x1B[38;5;14m%s\x1B[0m不允许部署，它可能仅用于本地调试。', APP_CONFIG.applicationName);
	process.exit(9);
}

avosrun('app').then(function (){
	require('../deploy_helper/modify_package');
	return avosrun('deploy');
}).then(function (){
	return new Promise(function (resolve, reject){
		setTimeout(function (){
			return avosrun('publish').then(resolve, reject);
		}, 3000);
	})
}).then(null, function (){
	console.log.apply(console.log, arguments);
});
