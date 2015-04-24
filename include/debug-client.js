// var AV = Object.AV;
var fs = require('fs');

module.exports = init;
function init(app){
	if(!process.env.LEANG_DEBUG_PORT){
		return;
	}
	console.log('协调开始');
	var port = process.env.LEANG_DEBUG_PORT;
	global.AV = AV;
	global.debug_shutdown = debug_shutdown;
	
	process.stdout.isTTY = true;
	
	console.log('神经接续开始');
	var replfix = require(AV.GROOT + 'include/debug-client/repl_bug');
	var repl = global.repl = require('repl').start({
		prompt         : 'AVOS> ',
		input          : process.stdin,
		output         : process.stdout,
		useGlobal      : true,
		terminal       : true,
		ignoreUndefined: true,
		eval           : replfix.eval
	});
	replfix.ctrl_c();
	
	try{
		require('repl.history')(repl, AV.APPPATH + '.avoscloud/repl_history');
		console.log('同步率100%');
	} catch(e){
		console.log('同步率90%');
		setTimeout(function (){
			console.log('\x1B[38;5;14m推荐使用repl.history，可以保存输入历史\x1B[0m');
			repl.displayPrompt();
		}, 2000)
	}
	
	require(AV.GROOT + 'include/debug-client/outgoing_message_shim');
	console.log('星际显像工具启动');
	
	require(AV.GROOT + 'include/debug-client/debug_helper_functions');
	console.log('超级指令就绪');
	
	require(AV.GROOT + 'include/debug-client/readline_bug')(repl);
	console.log('树状图设计者链接成功');
	
	require(AV.GROOT + 'include/debug-client/debugger_rpc')(port);
	console.log('次元隧道启动，连接目标：', port);
	
	console.log('\x1B[38;5;10m启动成功，世界线变动率\x1B[38;5;14m1.048596\x1B[0m');
}

var shuting_down = false;
function debug_shutdown(status){
	if(shuting_down){
		return;
	}
	shuting_down = true;
	process.exit(status || 0);
}
