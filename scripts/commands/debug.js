/**
 * @title: 开启本地调试服务器，可以在本地浏览器里调试所有代码逻辑。
 * @windowTitle: 调试
 */
var controller = require('../debugger/bootstrap');
var colors = global.colors = require('colors/safe');
var console = new LogPrepend('调试服务器管理');
var reconfigure = require('../debugger/reconfigure');

console.info('正在启动LeanCloud本地调试服务器……');
global.deploySettings.ensureDependence(true);

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
process.removeAllListeners('uncaughtException');
process.on('uncaughtException', function (e){
	console.error('调试父进程捕捉到未处理的异常，退出调试进程并等待结束。。', e.stack);
	shuttingDown = true;
	controller.shutdownService();
});

controller.on('terminate', remove_start_timeout);
controller.on('shutdown', remove_start_timeout);
controller.on('start', start_timeout);
controller.on('started', remove_start_timeout);
controller.on('shutdown', function (code){
	switch(code){
	case 0:
		console.info('正常退出~Bye~');
		process.exit(0);
		break;
	case 9:
		console.info('错误退出~Bye~');
		process.exit(9);
		break;
	case 201:
		process.exit(201);
		break;
	case 100:
		reconfigure.all();
		console.info('restarting...');
		controller.startService();
		break;
	default:
		console.error('服务器非正常退出，返回码为 [%s] ', code);
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
