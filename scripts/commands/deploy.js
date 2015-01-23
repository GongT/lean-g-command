/**
 * @title: 部署当前代码到测试和发布环境
 */
var avosrun = require('../avrun.js');

avosrun.external('git', ['pull']);

avosrun('app').then(function (){
	return avosrun('deploy');
}).then(function (){
	return avosrun('publish');
}).then(null, function (){
	console.log.apply(console.log, arguments);
});
