var SIG_SUCCESS = 'Press CTRL-C to stop server.\n';
var SIG_ERROR = 'Error: ';
var console = new LogPrepend('输入输出控制');
var logparser = require('./logparser');
var EventEmitter = require('events').EventEmitter;

module.exports = function (stdout, stderr){
	var emitter = new EventEmitter;
	stdout.handler = collect_output.bind(stdout);
	stdout.bind = process.stdout;
	stdout.store = '';
	stdout.other = stderr;
	stdout.emitter = emitter;
	stdout.on('data', stdout.handler);
	
	stderr.handler = collect_output.bind(stderr);
	stderr.bind = process.stderr;
	stderr.store = '';
	stderr.other = stdout;
	stderr.emitter = emitter;
	stderr.on('data', stderr.handler);
	
	return emitter;
};

function collect_output(data){
	this.store += data.toString();
	
	var error = this.store.indexOf(SIG_ERROR);
	if(error != -1){
		console.error('发生错误：');
		set_passed(this);
		this.emitter.emit('fail', error);
		return;
	}
	
	var success = this.store.indexOf(SIG_SUCCESS);
	if(success != -1){
		console.success('接收到初始化完毕信号！');
		this.store = this.store.substr(success + SIG_SUCCESS.length);
		this.other.store = '';
		set_passed(this);
		this.emitter.emit('success');
	}
}

function set_passed(stream){
	_set_passed(stream.other);
	_set_passed(stream);
}

function _set_passed(stream){
	stream.removeListener('data', stream.handler);
	
	stream.bind.write(stream.store);
	delete stream.store;
	
	stream.on('data', function (data){
		stream.bind.write(logparser(data));
	});
	
	delete stream.other;
}
