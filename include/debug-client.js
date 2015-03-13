// var AV = Object.AV;
var fs = require('fs');

module.exports = init;
function init(app){
	if(!process.env.DEBUG){
		return;
	}
	console.log('starting server with debug console...');
	global.AV = AV;
	var exiting = false;
	process.stdout.isTTY = true;
	process.stdin.removeAllListeners('data');
	process.stdout.removeAllListeners('data');
	process.stdin.on('end', function (){
		if(!exiting){
			process.graceful_exit(111);
		}
	});
	process.on('exit', function (){
		process.graceful_exit(10);
	});
	process.on('UncaughtException', function (){
	});
	process.graceful_exit = function (exit_code){
		console.trace('closing  -  ', exit_code);
		exiting = true;
		process.stdout.write('关闭退出事件监听器\r');
		process.removeAllListeners();
		process.stdin.removeAllListeners();
		process.stdin.emit('end'); // close repl
		process.stderr.removeAllListeners();
		process.stdout.removeAllListeners();
		process.stdout.write('关闭远程日志          \r');
		AV.Logger.closeRemote();
		try{
			process.stdout.write('正在关闭远程过程调用         \r');
			fs.closeSync(3);
			process.stdout.write('                              \r');
		} catch(e){
			console.log('\n' + e.message);
		}
		process.stdin.pause();
		process.stdin.setRawMode(false);
		process.exit(exit_code || 0);
	};
	
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
		repl.historyInited = true;
	} catch(e){
	}
	console.log('\r\x1B[38;5;14mrepl started\x1B[0m');
	
	require(AV.GROOT + 'include/debug-client/outgoing_message_shim');
	
	if(AV.CONFIG.lean.template && AV.CONFIG.lean.template == 'smarty'){
		app.use(function (_1, _2, next){
			AV.nsmarty.clearCache();
			next();
		});
	}
	
	require(AV.GROOT + 'include/debug-client/debug_helper_functions');
	
	require(AV.GROOT + 'include/debug-client/readline_bug')(repl);
	
	process.on('SIGPIPE', function (){
		process.stdin.write('Children[' + process.pid + ']: 进入命令行交互界面...\n');
		if(!repl.historyInited){
			process.stdin.write('安装 repl.history 可以保存输入历史。(npm install repl.history)\n');
		}
		process.stdin.write('\n');
		repl.displayPrompt();
	});
	
	setTimeout(function (){
		repl.displayPrompt();
	}, 1000);
	
	require(AV.GROOT + 'include/debug-client/debugger_rpc')();
}
