/**
 * @title 开启本地调试服务器，可以在本地浏览器里调试所有代码逻辑。
 */
var path = require('path');

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
		child.kill('SIGINT');
	}
	
	update_config();
	if(child === null){
		process.stdout.write('Starting server process...\r');
	}
	child = require('child_process').spawn(path.resolve(ROOT, '../avoscloud-code/bin/run.js'), [],
			{
				stdio: [process.stdin, 'pipe', 'pipe'],
				env  : process.env
			});
	child.on("exit", function (code){
		process.stdin.setRawMode(false);
		process.stdin.resume();
		if(code == 0 && ctrlCpress){
			console.log('\n\x1B[38;5;14m结束调试（因为按下了 ^C）\x1B[0m');
			process.exit();
		}
		if(code == 10){
			console.log('\n\x1B[38;5;9m服务器没有正确启动\x1B[0m\n===============================');
		}
		if(code != 0){
			console.log('\x1B[38;5;9mlean-cloud server failed with code ' + code + '\x1B[0m');
			if(!child.ispassthru && child.datacache){
				process.stdout.write('\x1B[38;5;9m' + child.datacache + '\x1B[0m');
			}
		}
		child = null;
	});
	child.stdout.on('data', collect_output.bind('stdout'));
	child.stderr.on('data', collect_output.bind('stderr'));
	child.datacache = '';
}
function restart_server(){
	if(killtime){
		clearTimeout(killtime);
	}
	killtime = setTimeout(real_restart_server, child? 2000 : 0);
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
	// process.stdout.write(this + ': ' + data);
	if(/\ueeee/.test(data)){
		ctrlCpress = true;
		child.kill('SIGINT');
		return;
	}
	var pos;
	if(!child.ispassthru){
		child.datacache += data.toString();
		pos = child.datacache.indexOf(SIG_ERROR);
		if(pos != -1){
			process.stdout.write(colorful_error(child.datacache));
			child.datacache = '';
			process.stdout.write('\x1B[38;5;9m\nServer start FAILED!\x1B[0m\n');
			child.kill('SIGINT');
			return;
		}
		
		pos = child.datacache.indexOf(SIG_SUCCESS);
		if(pos != -1){
			process.stdout.write('\x1B[38;5;10m\nServer restart OK!\x1B[0m\n');
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
