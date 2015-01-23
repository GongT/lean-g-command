/**
 * @title: 运行单元调试测试，后面再加一个参数，是要执行的测试
 */
APP_CONFIG.isDebugEnv = true;
global.unit = {
	stage: 0
};

process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('uncaughtException', cleanup);

console.log('=================init cloud code env=================');
global.AV = require('avoscloud-sdk').AV;
require(__dirname + '/../../cloud/main.js');
/* env init complete */
// unit.stage = 1;

AV.Cloud.run({});

function cleanup(){
	switch(unit.stage){
	case 0:
		console.error('\n初始化失败，代码中有语法错误。\n');
		break;
	case 1:
		break;
	default:
		console.error('\n运行状态有问题：%d。\n', unit.stage);
	}
}
