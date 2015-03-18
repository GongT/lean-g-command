var console = new LogPrepend('文件监视器');

var watch;

function on_file_add(f){
	console.log('file add ', f);
}

function on_file_delete(f){
	console.log('file delete ', f);
}

module.exports.start = function (){
	watch = require('chokidar').watch(require('fs').realpathSync('./'), {
		ignored      : /\.git|\.idea|\.avoscloud|README|___jb_bak___|__gen|public\/|views\//,
		ignoreInitial: true
	});
	setImmediate(function (){
		watch.on('add', on_file_add).on('change', on_file_change).on('unlink', on_file_delete)
	});
};

module.exports.stop = function (){
	watch.destroy();
};

require('events').EventEmitter.apply(module.exports);

function on_file_change(path){
	console.log('file change ', path);
	// process.stderr.write('\r*** file changed: ' + path + ' ***\r');
	if(/[\/\\](timers|trigger)[\/\\]/.test(path)){
		console.log('\x1B[38;5;14m触发器和定时器需要部署才能生效！\x1B[0m');
	} else if(/[\/\\](config)[\/\\]/.test(path)){
	} else if(/[\/\\]errormessage.json/.test(path)){
	} else if(/[\/\\](lean-g)[\/\\]/.test(path)){
		console.log('核心模块有改动，当前进程退出。');
	}
}
