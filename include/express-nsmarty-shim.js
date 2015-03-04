var _ = require('util');
// var AV = Object.AV;
var nsmarty = AV.nsmarty = require('nsmarty');
var basename = require('path').basename;

delete nsmarty.tpl_path;
nsmarty.tpl_path = AV.server.get('views') + '/';
AV.server.engine('.tpl', parse);

module.exports.parse = register;
module.exports.parseFile = function (file){
	var name = basename(file, '.js');
	var fn = require(AV.GROOT + file);
	if(typeof fn === 'function'){
		var type = fn.type || 'function';
		register(type, name, fn);
	} else{ // function & block & modifier
		var s = false;
		if('function' in fn){
			registerFunction(name, fn['function']);
			s = true;
		}
		if('block' in fn){
			registerBlock(name, fn['block']);
			s = true;
		}
		if('modifier' in fn){
			registerModifier(name, fn['modifier']);
			s = true;
		}
		if(!s){
			console.error('template function ' + name + ' define error');
		}
	}
};

function registerBlock(name, fn){
	register('block', name, fn);
}
function registerFunction(name, fn){
	register('function', name, fn);
}
function registerModifier(name, fn){
	register('modifier', name, fn);
}

function register(type, name, fn){
	delete fn.type;
	if(!nsmarty[type]){
		nsmarty[type] = {};
	}
	nsmarty[type][name] = fn;
	nsmarty.Parser.prototype.registerPlugin(type, name, fn);
}

function parse(path, options, fn){
	var cache = '';
	var stream = nsmarty.assign(path, options);
	stream.on('data', function (data){
		cache += data.toString();
	});
	var end = function (){
		fn(null, cache);
		cache = '';
	};
	stream.on('end', end);
	stream.on('close', end);
	stream.on('error', fn);
}
