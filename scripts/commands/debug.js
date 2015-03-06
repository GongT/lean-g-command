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
	ignored      : /\.git|\.idea|\.avoscloud|node_modules|README|___jb_bak___|__gen|public\//,
	ignoreInitial: true
}).on('add', on_file_change_struct).on('change', on_file_change).on('unlink', on_file_change_struct);

//do something when app is closing
process.on('exit', cleanup);
//catches ctrl+c event
process.on('SIGINT', cleanup);
//catches uncaught exceptions
process.on('uncaughtException', cleanup);

var child, killtime = 0, ctrlCpress = false;
function real_restart_server(){
	killtime = 0;
	if(child){
		process.stdout.write('   Server process now restarting...\r');
		child.unref();
		child.removeAllListeners('exit');
		process.stdin.setRawMode(false);
		child.kill('SIGINT');
	}
	
	update_config();
	if(child === null){
		process.stdout.write('Starting server process...\r');
	}
	child = avosrun.spawn(['-P', port],
			{
				stdio: [process.stdin, 'pipe', 'pipe'],
				env  : process.env
			});
	child.on("exit", function (code){
		process.stdin.setRawMode(false);
		process.stdin.pause();
		if(code == 9 || (code == 0 && ctrlCpress)){
			console.log(colors.red('\n结束调试（因为按下了 ^C）'));
			reset_input_and_exit();
		}
		if(code == 10){
			console.log(colors.red('\n服务器没有正确启动\x1B[0m\n==============================='));
		}
		if(code == 100){
			real_restart_server();
			return;
		}
		if(code != 0){
			console.log(colors.red('lean-cloud server failed with code ' + code));
			if(!child.ispassthru && child.datacache){
				process.stdout.write('\x1B[38;5;9m' + child.datacache + '\x1B[0m');
			}
		}
		child = null;
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
	killtime = setTimeout(real_restart_server, child? 2000 : 0);
}

function start_timeout(){
	if(child.starting){
		clearTimeout(child.starting);
	}
	child.starting = setTimeout(function (){
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
	process.stderr.write('\rfile changed: ' + path);
	if(/errormessage\.json/.test(path)){
		need_update.errno = true;
	}
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
	}
	restart_server();
}
function on_file_change_struct(path){
	if(killtime && need_update.everything){
		restart_server();
		return;
	}
	process.stderr.write('\rfile added or removed: ' + path);
	var will_restart = false;
	if(/[\/\\](debug|functions)[\/\\]/.test(path)){
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
	// process.stdout.write('\x1B[48;5;238m' + this + ': ' + data + '\x1B[0m');
	if(/\ueeee/.test(data)){
		console.log('children ctrl+c');
		setTimeout(function (){ // handle some time ctrl+c not affect
			if(child){
				ctrlCpress = true;
				child.unref();
				child.kill('SIGINT');
				process.stdin.setRawMode(false);
				process.stdin.resume();
			}
		}, 1000);
		return;
	}
	var pos;
	if(!child.ispassthru){
		start_timeout();
		child.datacache += data.toString();
		pos = child.datacache.indexOf(SIG_ERROR);
		if(pos != -1){
			remove_start_timeout();
			process.stdout.write(colorful_error(child.datacache));
			child.datacache = '';
			process.stdout.write('\n' + colors.red('Server start FAILED!') + '\n');
			process.stdin.setRawMode(false);
			child.kill('SIGINT');
			return;
		}
		
		pos = child.datacache.indexOf(SIG_SUCCESS);
		if(pos != -1){
			remove_start_timeout();
			process.stdout.write('\x1B[38;5;10m\nServer restart OK!\x1B[0m\n');
			process.stdout.write('\n打开 http://localhost:' + port + '/ 调试网站\n' +
			                     '打开 http://localhost:' + port + '/avos 调试云代码\n\n' +
			                     '进入命令行交互界面...\n');
			process.stdout.write(child.datacache.substr(pos + SIG_SUCCESS.length));
			child.stdout.pipe(process.stderr);
			child.stderr.on('data', function (data){
				data = colorful_error(data.toString());
				process.stdout.write('\x1B[38;5;1m' + data + '\x1B[0m');
			});
			delete child.datacache;
			child.ispassthru = true;
			
			process.stdin.setRawMode(true);
			process.stdin.pause();
		}
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
	watch.close();
	if(child){
		reset_input();
		child.kill('SIGINT');
	}
}

var need_update = {
	none: function (){
		for(var i in global.update){
			need_update[i] = false;
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

process.stdout.write('starting lean-cloud server... ');
real_restart_server();

function reset_input(){
	process.stdin.setRawMode(false);
	process.stdin.pause();
	process.stdout.pause();
	process.stderr.pause();
}
function reset_input_and_exit(){
	reset_input();
	/*if(fs.existsSync('/usr/bin/stty')){
		require('child_process').spawnSync('/usr/bin/stty', ['echo'], {
			"stdio": [process.stdin, process.stdout, process.stderr]
		});
	} else if(fs.existsSync('/bin/stty')){
		require('child_process').spawnSync('/bin/stty', ['echo'], {
			"stdio": [process.stdin, process.stdout, process.stderr]
		});
	}
	require('child_process').spawnSync('/bin/stty', [], {
		"stdio": [process.stdin, process.stdout, process.stderr]
	});*/
	process.exit(0);
}
