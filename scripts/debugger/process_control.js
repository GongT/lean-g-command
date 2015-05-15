var avrun = require('../avrun.js');
var remoteCall = require('./remote_call');
var port = LeanParams.debug || 3000;
var console = new LogPrepend('进程管理器');

var EventEmitter = require('events').EventEmitter;
require('util')._extend(ProcessController.prototype, EventEmitter.prototype);
module.exports = ProcessController;

function ProcessController(){
	this.running = false;
	EventEmitter.call(this);
}

ProcessController.prototype.start = function (cb){
	if(this.running){
		console.error('试图启动已经启动的进程');
		process.exit(0);
	}
	var self = this;
	self.running = true;
	this.remote = remoteCall.init(function (){
		self.child = avrun.spawn(['-P', port.toString()],
				{
					stdio: [process.stdin, 'pipe', 'pipe'],
					env  : process.env
				}, function (a, b, c){
					console.log(a, b, c);
				});
		self.register_handlers(function (){
			if(cb){
				cb();
			} else{
				console.warn('逻辑启动成功回调函数没有指定');
			}
		});
	});
};

ProcessController.prototype.shutdown = function (cb){
	if(cb){
		this.exitcallback = cb;
	} else{
		console.trace('\x1B[38;5;9m要求关闭服务器而没有添加回调！\x1B[0m');
		process.exit(1);
	}
	if(this.remote){
		this.call('debug_shutdown(0);');
	} else{
		this.kill('SIGTERM');
		this.running = false;
	}
};
ProcessController.prototype.kill = function (){
	if(!this.running){
		console.error('try to kill stopped child');
		return;
	}
	if(this.child){
		this.child.kill('SIGTERM');
		this.running = false;
	}
};
ProcessController.prototype.call = function (params){
	this.remote.run(params);
};
ProcessController.prototype.isRunning = function (){
	return this.running;
};
ProcessController.prototype.register_handlers = function (cb){
	var self = this;
	this.child.on('exit', function (code){
		// console.log('调试进程退出，状态：', code);
		self.running = false;
	});
	this.child.on('close', function (code){
		console.log('调试进程完全关闭：%s', code);
		self.running = false;
		self.emit('shutdown', code);
		if(self.exitcallback){
			self.exitcallback();
			self.exitcallback = null;
		} else{
			console.log('没有注册退出处理函数（进程主动退出）');
		}
	});
	this.child.stderr.on('data', require('./logparser'));
	
	var em = require('./process_stdio')(this.child.stdout, this.child.stderr);
	
	em.on('success', function (){
		cb();
		self.call('console.log("\\n\\t浏览器打开 http://127.0.0.1:' + port.toString() +
		          '/ 进行调试\\n\\t这里是一个node自带的repl，相当于直接运行“node”之后出现的“>”可以查看变量内容等。\\n\\t输入rs强制重启服务器，help查看更多指令\\n");repl.displayPrompt();')
	});
	em.on('fail', function (){
		console.error('启动失败：调试服务器报告了一个错误');
	});
};

