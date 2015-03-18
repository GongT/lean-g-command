var avrun = require('../avrun.js');
var remoteCall = require('./remote_call');
var port = LeanParams.debug || 3000;
var reconfigure = require('./reconfigure');
var console = new LogPrepend('进程管理器');

var EventEmitter = require('events').EventEmitter;
require('util')._extend(ProcessController.prototype, EventEmitter.prototype);
module.exports = ProcessController;

function ProcessController(){
	this.running = false;
	EventEmitter.call(this);
}

ProcessController.prototype.start = function (cb){
	reconfigure.config();
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
ProcessController.prototype.shutdown = function (){
	if(this.remote){
		this.call('debug_shutdown("normal");');
	} else{
		this.child.kill('SIGTERM');
	}
};
ProcessController.prototype.kill = function (){
	this.child.kill('SIGTERM');
};
ProcessController.prototype.call = function (params){
	this.remote.run(params);
};
ProcessController.prototype.register_handlers = function (){
	var self = this;
	this.child.on('exit', function (code){
		// console.log('调试进程退出，状态：', code);
		self.running = false;
	});
	this.child.on('close', function (code){
		// console.log('调试进程完全关闭：', code);
		self.running = false;
		self.emit('shutdown', code)
	});
	this.child.stderr.on('data', require('./logparser'));
	
	require('./process_stdio')(this.child.stdout, this.child.stderr, this);
	
	this.on('success', function (){
		self.call('repl.displayPrompt();')
	});
};

