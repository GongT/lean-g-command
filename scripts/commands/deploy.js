/**
 * @title: 部署当前代码到测试和发布环境
 */
var avosrun = require('../avrun.js');
var fs = require('fs');
var Promise = require('promise');

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
