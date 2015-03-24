/**
 * @title: 部署当前代码到测试环境
 */
var avosrun = require('../avrun.js');

avosrun('app').then(function (){
	return avosrun('deploy');
}).then(null, function (){
	console.log.apply(console.log, arguments);
});
