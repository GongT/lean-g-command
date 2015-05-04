/**
 * @title: 部署测试环境代码到发布环境
 * @windowTitle: 部署到发布环境
 */
var avosrun = require('../avrun.js');

avosrun('app').then(function (){
	return avosrun('publish');
}).then(null, function (){
	console.log.apply(console.log, arguments);
});
