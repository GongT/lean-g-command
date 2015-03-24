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
	var self = this;
	this.remote = remoteCall.init(function (){
		self.child = avrun.spawn(['-P', port.toString()],
				{
					stdio: [process.stdin, 'pipe', 'pipe'],
					env  : process.env
				}, function (a, b, c){
					console.log(a, b, c);
				});
		self.register_handlers();
		cb();
	});
};

ProcessController.prototype.shutdown = function (cb){
	if(cb){
		this.exitcallback = cb;
	}
	if(this.remote){
		this.call('debug_shutdown("normal");');
	} else{
		this.kill('SIGTERM');
	}
};
ProcessController.prototype.kill = function (){
	if(!this.running){
		console.error('try to kill stopped child');
		return;
	}
	if(this.child){
		this.running = false;
		this.child.kill('SIGTERM');
	}
};
ProcessController.prototype.call = function (params){
	this.remote.run(params);
};
ProcessController.prototype.isRunning = function (){
	return this.running;
};
ProcessController.prototype.register_handlers = function (){
	var self = this;
	this.child.on('exit', function (code){
		console.log('调试进程退出，状态：', code);
		self.running = false;
	});
	this.child.on('close', function (code){
		console.log('调试进程完全关闭：', code);
		self.running = false;
		self.emit('shutdown', code);
		if(self.exitcallback){
			self.exitcallback();
		} else{
			console.log('没有注册退出处理函数');
		}
	});
	this.child.stderr.on('data', require('./logparser'));
	
	var em = require('./process_stdio')(this.child.stdout, this.child.stderr);
	
	em.on('success', function (){
		self.running = true;
		self.call('console.log("\\n\\t浏览器打开 http://127.0.0.1:' + port.toString() +
		          '/ 进行调试\\n\\t这里是一个node自带的repl，相当于直接运行“node”之后出现的“>”可以查看变量内容等。\\n\\t输入rs强制重启服务器，help查看更多指令\\n");repl.displayPrompt();')
	});
	em.on('fail', function (){
		self.running = false;
		console.error('启动失败：调试服务器报告了一个错误');
	});
};

