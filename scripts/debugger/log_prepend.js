module.exports = LogPrepend;

var levels = {
	'print'  : 'DEBUG',
	'debug'  : 'DEBUG',
	'info'   : 'INFO',
	'log'    : 'LOG',
	'warn'   : 'WARN',
	'error'  : 'ERROR',
	'success': 'OK'
};
var levels_color = {
	'print'  : '0;40;90',
	'debug'  : '1;40;97',
	'info'   : '1;40;96',
	'log'    : '0',
	'warn'   : '0;40;33',
	'error'  : '5;40;31',
	'success': '1;40;92'
};

function LogPrepend(prepend){
	this._prepend = '[' + prepend + ']';
}
LogPrepend.prototype.print = createPrepend('print', console.log);
LogPrepend.prototype.debug = createPrepend('debug', console.log);
LogPrepend.prototype.info = createPrepend('info', console.log);
LogPrepend.prototype.log = createPrepend('log', console.log);
LogPrepend.prototype.warn = createPrepend('warn', console.error);
LogPrepend.prototype.error = createPrepend('error', console.error);
LogPrepend.prototype.success = createPrepend('success', console.log);

function createPrepend(level, fn){
	var restore = '\x1B[0m';
	var color = levels_color[level.toLowerCase()];
	color = color? '\x1B[' + color + 'm' : '';
	level = '[' + levels[level] + '] ';
	
	return function (){
		for(var i = 0; i < arguments.length; i++){
			if(arguments[i] instanceof Error){
				arguments[i] = arguments[i].stack;
			}
		}
		if(typeof arguments[0] == 'string'){ // log("debug %s is %d", a, b)
			arguments[0] = color + this._prepend + level + restore + arguments[0];
			fn.apply(console, arguments);
		} else if(arguments.length <= 1){ // log(10086)
			fn.apply(console, [color + this._prepend + level + restore, arguments[0]]);
		} else{ // log(10086, ab, cd)
			var args = [color + this._prepend + level + restore].concat(arguments);
			fn.apply(console, args);
		}
	};
}
