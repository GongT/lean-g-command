// var AV = Object.AV;
module.exports = Logger;
var remoteLogger = AV.CONFIG.remoteLogger, loggerSocket;
var format = require('util').format;

var levels = {
	'print': 'DEBUG',
	'debug': 'DEBUG',
	'info' : 'INFO',
	'log'  : 'LOG',
	'warn' : 'WARN',
	'error': 'ERROR',
	'trace': 'TRACE'
};
var levels_color = {
	'print': '0;40;90',
	'debug': '1;40;97',
	'info' : '1;40;96',
	'log'  : '0',
	'warn' : '0;40;33',
	'error': '5;40;31',
	'trace': '0;40;33'
};

var regist = [];
var noLocal = [];

if(!AV.isDebugEnv){ // 正式环境不要info和debug
	noLocal.push('debug');
	noLocal.push('info');
}

(function (){ // 测试环境接受命令行参数 有颜色
	if(AV.localhost){
		for(var name in levels){
			var first = name.substr(0, 1);
			if(process.argv.indexOf('+' + first)){
				var reen = noLocal.indexOf(name);
				if(reen >= 0){
					noLocal.splice(reen, 1);
				}
			} else if(process.argv.indexOf('-' + first)){
				noLocal.push(name);
			}
			levels[name] = levels[name].toUpperCase();
			if(levels_color[name]){
				var color = '\x1B[' + levels_color[name] + 'm';
				var normal = '\x1B[0m';
				levels[name] = color + levels[name] + normal;
			}
		}
	} else{
		noLocal.push('print');
		noLocal.push('debug');
	}
})();

(function (){
	if(!AV.localhost){
		delete levels['trace'];
	}
	for(var name in levels){ // 准备所有级别的输出函数
		var text = levels[name];
		var fn = console.log;
		if(AV.localhost || name == 'warn' || name == 'error'){
			fn = console['error'];
		}
		if(name == 'trace'){
			fn = console['trace'];
		}
		
		Logger[name + 'ToLocalOnly'] = createPrepend(text, fn);
		Logger[name + 'ToNull'] = noop;
		if(remoteLogger){
			Logger[name + 'ToLocalRemote'] = createPrepend(text, remote(fn));
			Logger[name + 'ToRemoteOnly'] = createPrepend(text, remote());
		} else{
			Logger[name + 'ToLocalRemote'] = Logger[name + 'ToLocalOnly'];
			Logger[name + 'ToRemoteOnly'] = Logger[name + 'ToNull'];
		}
	}
})();

function Logger(msg){
	if(regist[msg]){
		return regist[msg];
	}
	this._prepend = '[' + msg + ']';
	if(AV.localhost){
		this._prepend = '\x1B[0m' + this._prepend;
	}
	for(var name in levels){
		if(noLocal.indexOf(name) == -1){
			this.enableLocal(name);
		} else{
			this.disableLocal(name);
		}
	}
}
Logger.prototype.enableLocal = function (level){
	if(level == 'debug'){
		this[level] = Logger[level + 'ToLocalOnly'];
	} else{
		this[level] = Logger[level + 'ToLocalRemote'];
	}
};
Logger.prototype.disableLocal = function (level){
	if(level == 'debug'){
		this[level] = Logger[level + 'ToNull'];
	} else{
		this[level] = Logger[level + 'ToRemoteOnly'];
	}
};
Logger.enableLocal = function (level){
	var item = noLocal.indexOf(level);
	if(item != -1){
		noLocal.splice(item, 1);
		regist.forEach(function (log){
			log.enableLocal(level);
		});
	}
};
Logger.disableLocal = function (level){
	var item = noLocal.indexOf(level);
	if(item == -1){
		noLocal.push(item);
		regist.forEach(function (log){
			log.disableLocal(level);
		});
	}
};
Logger.status = noLocal;

Logger.prototype.debug_database = (noLocal.indexOf('debug') == -1)? function (p, text){
	var self = this;
	if(!text){
		text = '';
	}
	p.then(function (){
		self.debug(text + ' save complete');
	}, function (e){
		self.error(text + ' save failed');
		self.error(e);
	});
	return p;
} : function (p){
	return p;
};

function createPrepend(level, fn){
	if(!fn){
		return noop;
	}
	return function (){ // this is `Logger`
		for(var i = 0; i < arguments.length; i++){
			if(arguments[i] instanceof Error){
				arguments[i] = arguments[i].stack;
			}
			if(arguments[i] instanceof AV.ApiError){
				arguments[i] = arguments[i].toJSON();
			}
		}
		if(typeof arguments[0] == 'string'){ // log("debug %s is %d", a, b)
			arguments[0] = this._prepend + '[' + level + '] ' + arguments[0];
			fn.apply(console, arguments);
		} else if(arguments.length <= 1){ // log(10086)
			fn.apply(console, [this._prepend + '[' + level + '] ', arguments[0]]);
		} else{ // log(10086, ab, cd)
			var args = [this._prepend + '[' + level + '] '].concat(arguments);
			fn.apply(console, args);
		}
	};
}
function getTs(){
	var d = new Date();
	d.setHours(d.getHours() + 8);
	return '[' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
	       pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '.' +
	       pad3(d.getMilliseconds()) + ']';
}
function pad(n){
	var s = n.toString();
	return s.length == 2? s : '0' + s;
}
function pad3(n){
	var s = n.toString();
	if(s.length == 2){
		return '0' + s;
	} else if(s.length == 1){
		return '00' + s;
	} else{
		return s;
	}
}
function noop(){
}

if(remoteLogger){
	create_client();
}

function remote(fn){
	if(!remoteLogger){
		return fn;
	}
	if(fn){
		return function (){
			fn.apply(console, arguments);
			socket_write(arguments);
		}
	} else{
		return function (){
			socket_write(arguments);
		}
	}
}
function create_client(){
	var net = require('net');
	var connected = false, retryTimeout = 0;
	
	loggerSocket = new net.Socket();
	
	loggerSocket.cache = ''; // fixme 这个貌似没起作用
	
	loggerSocket.on('end', function (){
		console.error('[RemoteLogger]服务器关闭');
	});
	loggerSocket.on('connect', function (){
		retryTimeout = 0;
		console.log('[RemoteLogger]socket created ... 级别 [' + noLocal.join(',') + '] 将不会出现在leancloud后台');
		connected = true;
		if(loggerSocket.cache){
			loggerSocket.write(loggerSocket.cache);
			loggerSocket.cache = '';
		}
	});
	loggerSocket.on('timeout', function (){
		console.error('[RemoteLogger]socket写入超时');
	});
	loggerSocket.on('error', function (e){
		console.error('[RemoteLogger]socket发生错误：' + e.message);
	});
	loggerSocket.on('close', function (e){
		connected = false;
		setTimeout(function (){
			reconnect();
			if(retryTimeout < 10000){
				retryTimeout += 1000;
			}
		}, retryTimeout);
	});
	
	reconnect();
}
function reconnect(){
	if(reconnect.never){
		return;
	}
	var config = remoteLogger.split(/:/);
	console.log('[RemoteLogger]创建连接 -> ' + config[0] + ':' + config[1]);
	loggerSocket.connect(config[1], config[0]);
}

function socket_write(args){
	var msg = format.apply(undefined, args);
	
	if(loggerSocket.writable){
		loggerSocket.write(getTs() + msg + '\n');
	} else{
		loggerSocket.cache += getTs() + msg + '\n';
	}
}

Logger.closeRemote = function (){
	reconnect.never = true;
	if(loggerSocket){
		try{
			loggerSocket.close();
		} catch(e){
		}
	}
};
