/**
 * @title: 生成配置文件（然后可以运行 avoscloud 命令）
 * @windowTitle: 生成配置文件
 */

var avosrun = require('../avrun.js');

avosrun('app').then(function (){
	console.log('生成完毕～');
	process.exit(0);
});
