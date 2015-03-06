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
	'error': 'ERROR'
};
var levels_color = {
	'print': '14',
	'debug': '8',
	'info' : '14',
	'log'  : '8',
	'warn' : '3',
	'error': '9'
};
var disabled = [];

function Logger(msg){
	for(var name in levels){
		var text = levels[name];
		if(disabled.indexOf(name) >= 0){
			if(name == 'debug'){
				this[name] = noop;
			} else if(remoteLogger){
				this[name] = prepend('[' + msg + '][' + text + '] ', remote());
			} else{
				this[name] = noop;
			}
		} else{
			var fn = console.log;
			if(name == 'warn' || name == 'error'){
				fn = console.error;
			}
			this[name] = prepend('[' + msg + '][' + text + '] ', remote(fn));
		}
	}
}

if(!AV.isDebugEnv){
	disabled.push('debug');
	disabled.push('info');
}

if(AV.localhost){
	for(var name in levels){
		var first = name.substr(0, 1);
		if(process.argv.indexOf('+' + first)){
			var reen = disabled.indexOf(name);
			if(reen >= 0){
				disabled.splice(reen, 1);
			}
		} else if(process.argv.indexOf('-' + first)){
			disabled.push(name);
		}
		levels[name] = levels[name];
		if(levels_color[name]){
			var color = '\x1B[38;5;' + levels_color[name] + 'm';
			var normal = '\x1B[0m';
			levels[name] = color + levels[name] + normal;
		}
	}
} else{
	disabled.push('print');
	delete levels['debug'];
	disabled.push('debug');
}
Logger.prototype.debug_database = (disabled.indexOf('debug') == -1)? function (p, text){
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

function prepend(what, fn){
	if(!fn){
		fn = console.log;
	}
	return function (){
		for(var i = 0; i < arguments.length; i++){
			if(arguments[i] instanceof Error){
				arguments[i] = arguments[i].stack;
			}
			if(arguments[i] instanceof AV.ApiError){
				arguments[i] = arguments[i].toJSON();
			}
		}
		if(typeof arguments[0] == 'string'){ // log("debug %s is %d", a, b)
			arguments[0] = what + arguments[0];
			fn.apply(console, arguments);
		} else if(arguments.length <= 1){ // log(10086)
			fn.apply(console, [what, arguments[0]]);
		} else{ // log(10086, ab, cd)
			var args = [what].concat(arguments);
			fn.apply(console, args);
		}
	}
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
		console.log('[RemoteLogger]socket created ... 级别 [' + disabled.join(',') + '] 将不会出现在leancloud后台');
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
