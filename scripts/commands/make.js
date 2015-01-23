/**
 * @title: 生成配置文件（然后可以运行 avoscloud 命令）
 */

var avosrun = require('../avrun.js');

avosrun('app').then(function (){
	process.exit(0);
});
