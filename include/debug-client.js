// var AV = Object.AV;
var fs = require('fs');

module.exports = init;
function init(app){
	if(!process.env.LEANG_DEBUG_PORT){
		return;
	}
	var isWindows = /^win/.test(process.platform);
	console.log('协调开始');
	var port = process.env.LEANG_DEBUG_PORT;
	global.AV = AV;
	global.debug_shutdown = debug_shutdown;
	process.stdout.isTTY = true;
	var d = new Date;
	if(d.getHours() !== d.getUTCHours()){
		setTimeout(function (){
			console.log('\x1B[38;5;9m你的本地时区不是协调世界时（其实就是UTC），调试时运行结果可能与服务器上完全不同，强烈建议调整本地时区。\x1B[0m');
			console.log('\x1B[38;5;9m现在开始使用伪装的Date对象，这个功能还没有完善，如果遇到问题，请务必报告。\x1B[0m');
			repl.displayPrompt();
		}, 2000);
		require(AV.GROOT + 'include/debug-client/dummy_date');
	}
	
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
		}, 2000);
	}
	
	require(AV.GROOT + 'include/debug-client/outgoing_message_shim');
	console.log('星际显像工具启动');
	
	require(AV.GROOT + 'include/debug-client/debug_helper_functions');
	console.log('超级指令就绪');
	
	require(AV.GROOT + 'include/debug-client/readline_bug')(repl);
	console.log('树状图设计者链接成功');
	
	require(AV.GROOT + 'include/debug-client/debugger_rpc')(port);
	console.log('次元隧道启动，连接目标：', port);
	
	handling_error(app);
	
	console.log('\x1B[38;5;10m启动成功，世界线变动率\x1B[38;5;14m%s\x1B[0m', Math.random() + 1);
}

module.exports.debuggerPages = function (app){
	app.locals['INTERNAL_TEMPLATE'] = AV.INTERNAL_TEMPLATE;
	require(AV.GROOT + 'include/debug-client/debug_page')(app);
};

var shuting_down = false;
function debug_shutdown(status){
	if(shuting_down){
		return;
	}
	shuting_down = true;
	process.exit(status || 0);
}

function handling_error(app){
	var require_missing = require(AV.GROOT + 'include/require_missing');
	process.on('uncaughtException', function (e){
		handler(e);
	});
	
	app.use(function (req, res, next){
		req.domain.on('error', function (err){
			handler(err);
		});
		req.domain.run(next);
	});
	
	function handler(e){
		var missing = require_missing.parse_require_error_stack(e.stack);
		if(missing.length == 0){
			console.error(e.stack);
			process.exit(7);
		} else{
			process.stderr.write('\r');
			missing = missing[0];
			var at = e.stack.split('\n')[5] || '';
			console.error('\n\n[!!] 发现本地缺少的依赖：\x1B[38;5;9m%s\x1B[0m，它没有在package.proto.json中正确注册。请修改。', missing);
			
			var f = /\((.*):([0-9]+):([0-9]+)\)/.exec(at);
			if(at && f){
				console.error('     该模块在文件 %s 的第 %s 行第一次被使用', f[1], f[2]);
			} else{
				console.error('     该模块 require("%s"); 导致的错误的堆栈：', e.stack);
			}
			console.error('\n');
			process.exit(201);
		}
	}
}
