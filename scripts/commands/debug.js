var port = LeanParams.debug || 3000;
var fs = require('fs');

/**
 * @title: 开启本地调试服务器，可以在本地浏览器里调试所有代码逻辑。
 */
var path = require('path');
var avosrun = require('../avrun.js');

if(!APP_CONFIG.isDebugEnv){
	APP_CONFIG.isDebugEnv = true;
	global.update.function();
}
console.log('=================start local debug service=================');

process.env.DEBUG = 1;
process.stdin.setEncoding('utf8');

var watch = require('chokidar').watch(require('fs').realpathSync('./'), {
	ignored      : /\.git|\.idea|\.avoscloud|README|___jb_bak___|__gen|public\/|views\//,
	ignoreInitial: true
});
setTimeout(function (){
	watch.on('add', on_file_change_struct).on('change', on_file_change).on('unlink', on_file_change_struct)
}, 1000);

process.on('exit', cleanup.bind('exit'));
process.on('SIGINT', cleanup.bind('SIGINT'));
process.on('uncaughtException', cleanup.bind('uncaughtException'));

var child, killtime = 0, ctrlCpress = false, firstTime = true, forceExitCode = 0;
function real_restart_server(){
	killtime = 0;
	if(child){
		child.removeAllListeners('exit');
		if(child.killed){
			child = null;
			return kill_child_restart();
		} else{
			return remote_call('process.exit();')
		}
	}
	
	update_config();
	if(child === undefined){
		console.log('正在启动……');
	} else if(child === null){
		console.log('正在重启……');
	}
	forceExitCode = false;
	child = avosrun.spawn(['-P', port],
			{
				stdio: [process.stdin, 'pipe', 'pipe', 'pipe'],
				env  : process.env
			});
	child.on('exit', function (code){
		// console.log('parent :: childrend exit %s', code)
		if(child){
			child.stdio[3].removeAllListeners();
			child.stdout.removeAllListeners();
			child.stderr.removeAllListeners();
		}
		if(!child.ispassthru && child.datacache){
			if(child.datacache.indexOf('uncaughtException: listen EADDRINUSE')){
				console.log('地址、端口被占用');
				process.exit(1);
			}
			process.stdout.write('\x1B[38;5;9m' + child.datacache + '\x1B[0m');
		}
	});
	child.on('close', function (code){
		if(child){
			child.removeAllListeners();
			child = null;
		}
		
		// console.log('parent :: childrend close %s -> %s ', code,forceExitCode);
		if(forceExitCode){
			code = forceExitCode;
		}
		if(code == 111 || (code == 0 && ctrlCpress)){
			console.log(colors.red('\n结束调试（因为按下了 ^C）...'));
			return;
		}
		if(code == 110){
			return real_restart_server();
		}
		if(code == 10){
			console.log(colors.red('\n服务器没有正确启动\x1B[0m\n==============================='));
		}
		if(code == 100){
			need_update.every(true);
			real_restart_server();
			return;
		}
		if(code != 0){
			if(ctrlCpress){
				process.exit(0);
				return;
			}
			if(code > 128){
				code = '信号' + (code - 128);
			}
			console.log(colors.red('本地调试初始化过程中子线程发生错误 - ' + code));
		}
	});
	child.stdout.on('data', collect_output.bind('stdout'));
	child.stderr.on('data', collect_output.bind('stderr'));
	child.datacache = '';
	start_timeout();
}

function restart_server(){
	if(killtime){
		clearTimeout(killtime);
	}
	killtime = setTimeout(function (){
		kill_child_restart();
	}, child? 2000 : 0);
}

function kill_child_restart(){
	if(forceExitCode){
		real_restart_server();
	} else{
		forceExitCode = 110;
		child.kill('SIGTERM');
	}
}

function start_timeout(){
	if(child.starting){
		clearTimeout(child.starting);
	}
	child.starting = setTimeout(function (){
		if(!child){
			return;
		}
		if(child.datacache){
			var msg = '服务器没有在规定时间内启动，可能出现错误，这些是启动过程中的输出';
			process.stdout.write("\n" + colors.red(msg) + "\n\n");
			process.stdout.write(child.datacache);
			child.datacache = '';
			process.stdout.write("\n(-- 下面可能还会有 --)\n");
		} else{
			msg = '服务器没有在规定时间内启动，可能出现错误，而且没有输出。';
			process.stdout.write("\n" + colors.red(msg) + "\n\n");
		}
	}, 5000);
}
function remove_start_timeout(){
	if(child.starting){
		clearTimeout(child.starting);
		child.starting = 0;
	}
}

function on_file_change(path){
	process.stderr.write('\r*** file changed: ' + path + ' ***\r');
	if(/[\/\\](timers|trigger)[\/\\]/.test(path)){
		console.log('\x1B[38;5;14m触发器和定时器需要部署才能生效！\x1B[0m');
	} else if(/[\/\\](config)[\/\\]/.test(path)){
		if(/global\.json/.test(path)){
			return;
		} else{
			need_update.config = true;
		}
	} else if(/[\/\\]errormessage.json/.test(path)){
		need_update.errno = true;
		/*} else if(/[\/\\](lean-g)[\/\\]/.test(path)){
		 console.log('核心模块有改动，当前进程退出。');
		 remote_call('process.graceful_exit(0);');
		 watch.close();
		 return;*/
	}
	restart_server();
}
function on_file_change_struct(path){
	process.stderr.write('\r*** file added or removed: ' + path + ' ***\r');
	if(killtime && need_update.everything){
		restart_server();
		return;
	}
	var will_restart = false;
	if(/[\/\\](functions-debug|functions)[\/\\]/.test(path)){
		need_update.function = true;
		need_update.debug = true;
		will_restart = true;
	} else if(/[\/\\](timers|trigger)[\/\\]/.test(path)){
		console.log('\x1B[38;5;14m触发器和定时器需要部署才能生效！\x1B[0m');
		will_restart = true;
	} else if(/[\/\\](library)[\/\\]/.test(path)){
		need_update.library = true;
		will_restart = true;
	} else if(/[\/\\](controllers|view_functions)[\/\\]/.test(path)){
		need_update.express = true;
		will_restart = true;
	} else if(/[\/\\](database)[\/\\]/.test(path)){
		need_update.module = true;
		will_restart = true;
	}
	
	if(will_restart){
		restart_server();
	}
}

var SIG_SUCCESS = 'Press CTRL-C to stop server.\n';
var SIG_ERROR = 'Error: ';
var server_root = new RegExp(RegExpEscape(require('path').resolve(__dirname + '/../..')), 'g');
function collect_output(data){
	if(!child){
		return process.stdout.write('\x1B[48;5;9m' + this + ': ' + data + '\x1B[0m');
	}
	// process.stdout.write('\x1B[48;5;238m' + this + ': ' + (data || '').toString() + '\x1B[0m');
	var pos;
	if(/\ueeee/.test(data)){
		if(child){
			var c = child;
			setTimeout(function (){ // handle some time ctrl+c not affect
				ctrlCpress = true;
				c.kill('SIGTERM');
				c = null;
			}, 50);
		}
		return;
	}
	if(!child.ispassthru){
		start_timeout();
		child.datacache += data.toString();
		pos = child.datacache.indexOf(SIG_ERROR);
		if(pos != -1){
			remove_start_timeout();
			process.stdout.write(colorful_error(child.datacache));
			child.datacache = '';
			process.stdout.write('\n' + colors.red('Server start FAILED!') + '\n');
			child.kill('SIGINT');
			return;
		}
		
		pos = child.datacache.indexOf(SIG_SUCCESS);
		if(pos != -1){
			remove_start_timeout();
			process.stdout.write('\x1B[38;5;10m\nServer restart OK!\x1B[0m\n');
			
			if(firstTime){
				firstTime = false;
				process.stdout.write('\n打开 http://localhost:' + port + '/ 调试网站\n' +
				                     '打开 http://localhost:' + port + '/avos 调试云代码\n');
				process.stdin.write('输入 rs 重启服务器\n输入 help 查看帮助\n');
			}
			
			process.stdout.write(child.datacache.substr(pos + SIG_SUCCESS.length) + '\n');
			child.stdout.pipe(process.stderr);
			child.stderr.on('data', function (data){
				data = colorful_error(data.toString());
				process.stdout.write('\x1B[38;5;1m' + data + '\x1B[0m');
			});
			delete child.datacache;
			child.kill('SIGPIPE');
			child.ispassthru = true;
			remote_call('process.stdout.columns = ' + process.stdout.columns + ';');
		}
	}
}

process.stdout.on('resize', function (){
	remote_call('process.stdout.columns = ' + process.stdout.columns + ';');
});

function remote_call(code){
	if(child && child.exitCode === null && child.stdio[3]){
		child.stdio[3].write(code + '\0');
	}
}

function colorful_error(s){
	return s.replace(/^([A-Za-z]*Error:.*)$/m, '\x1B[38;5;9m$1\x1B[0m')
			.replace(server_root, '')
			.replace(/at (.*) \(native\)/mg, '\x1B[38;5;235mat $1\x1B[0m')
			.replace(/at (.*) \(.+\/lean-g\/(.*\.js[:0-9]*)\)/mg, '\x1B[38;5;244mat $1 (G/$2)\x1B[0m')
			.replace(/at (.*) \(.+\/avoscloud-code\/node_modules\/(.*\.js[:0-9]*)\)/mg, '\x1B[38;5;238mat $1 ($2)\x1B[0m')
			.replace(/at (.*) \(.+\/avoscloud-code\/(.*\.js[:0-9]*)\)/mg, '\x1B[38;5;244mat $1 (AV/$2)\x1B[0m')
			.replace(/at (.*) \(\/cloud/mg, 'at \x1B[38;5;14m$1\x1B[0m (/cloud')
}
function cleanup(){
	process.removeAllListeners('exit');
	process.removeAllListeners('SIGINT');
	process.removeAllListeners('UncaughtException');
	process.on('exit', cleanup.bind('exit'));
	process.on('SIGINT', cleanup.bind('SIGINT'));
	process.on('uncaughtException', cleanup.bind('uncaughtException'));
	
	if(watch){
		watch.close();
		watch = null;
	}
	if(child){
		console.error('子线程还没有退出');
		global.preventExit = true;
	} else if(this == 'exit'){
		process.exit.apply(process, arguments);
	} else if(this == 'uncaughtException'){
		throw arguments[0];
	} else{
		process.exit(0);
	}
}

var need_update = {
	none : function (v){
		this.every(false);
	},
	every: function (v){
		for(var i in global.update){
			need_update[i] = v;
		}
	}
};
need_update.none();

function update_config(){
	for(var n in need_update){
		if(need_update[n] === true){
			need_update[n] = false;
			global.update[n]();
		}
	}
}

function RegExpEscape(s){
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

process.stdout.write('正在启动LeanCloud本地调试服务器……');
real_restart_server();
