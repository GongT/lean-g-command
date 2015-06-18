/**
 * @title: 部署当前代码到测试和发布环境
 * @windowTitle: 部署
 */
var helper = require('../lib/deploy_helper');

helper.prepare();
LeanFork.promise('app').then(function (){
	return helper.do_upload();
}).then(function (){
	return helper.do_publish();
}).then(function (){
	console.log('\x1B[38;5;10m部署操作非常成功的完成了！！！\x1B[0m');
}, function (code){
	console.log('\x1B[38;5;10m不知道有没有成功，请参考后台日志（avoscloud deploy 返回值是 %s ）\x1B[0m', code);
});
