/**
 * @title: 开启本地调试服务器，可以在本地浏览器里调试所有代码逻辑。
 */
var controller = require('../debugger/bootstrap');
var colors = global.colors = require('colors/safe');
var console = new LogPrepend('调试服务器管理');

console.info('正在启动LeanCloud本地调试服务器……');

var shuttingDown = false;
process.on('exit', function (code){
	if(controller.status > 0){
		shuttingDown = true;
		controller.terminateService();
	} else{
		process.exit(code);
	}
});
process.on('SIGINT', function (){
	shuttingDown = true;
	controller.shutdownService();
});
process.on('uncaughtException', function (e){
	console.error(e);
	shuttingDown = true;
	controller.terminateService();
});

controller.on('terminate', remove_start_timeout);
controller.on('shutdown', remove_start_timeout);
controller.on('start', start_timeout);
controller.on('started', remove_start_timeout);
controller.on('shutdown', function (code){
	switch(code){
	case 0:
		process.exit(0);
		break;
	case 100:
		console.info('restarting...');
		controller.restartService();
	default :
		console.error('调试服务器启动失败');
	}
});

controller.prepareService();
controller.startService();

var starting;
function start_timeout(self){
	if(starting){
		clearTimeout(starting);
	}
	starting = setTimeout(function (){
		if(!self){
			return;
		}
		var msg = '服务器没有在规定时间内启动，可能出现错误。';
		console.error("\n" + msg + "\n");
	}, 5000);
}

function remove_start_timeout(self){
	if(starting){
		clearTimeout(starting);
		starting = 0;
	}
}
