// var AV = Object.AV;
module.exports = Logger;

var levels = {
	'print': 'DEBUG',
	'debug': 'DEBUG',
	'info' : 'INFO',
	'log'  : 'INFO',
	'warn' : 'WARN',
	'error': 'ERROR'
};
var levels_color = {
	'print': '14',
	'debug': '8',
	'info' : '8',
	'log'  : '8',
	'warn' : '3',
	'error': '9'
};
var disabled = [];

function Logger(msg){
	for(var name in levels){
		if(disabled.indexOf(name) >= 0){
			this[name] = noop;
		} else{
			var text = levels[name];
			this[name] = prepend('[' + msg + '][' + text + '] ');
		}
	}
}

if(!AV.isDebugEnv){
	disabled.push('debug');
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
			var color = String.fromCharCode(27) + '[38;5;' + levels_color[name] + 'm';
			var normal = String.fromCharCode(27) + '[0m';
			levels[name] = color + levels[name] + normal;
		}
	}
} else{
	disabled.push('print');
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

function prepend(what){
	return function (){
		if(typeof arguments[0] == 'string'){
			arguments[0] = what + arguments[0];
			console.log.apply(console, arguments);
		} else if(arguments.length <= 1){
			console.log.apply(console, [what, arguments[0]]);
		} else{
			var args = [what].concat(arguments);
			console.log.apply(console, args);
		}
	}
}
function noop(){
}
