// var AV = Object.AV;
var fs = require('fs');

module.exports = init;
function init(app){
	if(!process.env.DEBUG){
		return;
	}
	console.log('starting server with debug console...');
	global.AV = AV;
	process.stdout.isTTY = true;
	process.stdin.removeAllListeners('data');
	process.stdout.removeAllListeners('data');
	
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
		process.stdin.write('Children: 进入命令行交互界面...\n');
		if(!repl.historyInited){
			process.stdin.write('安装 repl.history 可以保存输入历史。(npm install repl.history)\n');
		}
		process.stdin.write('\n');
		repl.displayPrompt();
	});
	
	require(AV.GROOT + 'include/debug-client/debugger_rpc')();
	
	setTimeout(function (){
		repl.displayPrompt();
	}, 1000);
}
