var extend = require('util')._extend;
var fs = require('fs');
var AV = global.AV;
var nsmarty = AV.nsmarty = require('nsmarty');
var basename = require('path').basename;

delete nsmarty.tpl_path;
nsmarty.tpl_path = AV.APP_PATH + AV.server.get('views') + '/';
AV.server.engine('.tpl', parse);
console.log('template path set to ', nsmarty.tpl_path);

module.exports.parse = register;
module.exports.loadViewFunctions = function (APP_PATH, GROOT){
	var vflist = {};
	extend(vflist, readdir(APP_PATH + 'cloud/view_functions/'));
	extend(vflist, readdir(GROOT + 'view_functions/'));
	AV.nsmarty.viewFunctionList = vflist;
	Object.keys(vflist).forEach(function (k){
		register_file(vflist[k]);
	});
};

function register_file(file){
	var name = basename(file, '.js');
	var fn = require(file);
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
}

function readdir(DIR){
	var vflist = {};
	if(fs.existsSync(DIR)){
		fs.readdirSync(DIR).filter(function isJsFile(f){
			return /\.js$/.test(f);
		}).forEach(function (f){
			vflist[basename(f, '.js')] = DIR + f;
		});
	}
	return vflist;
}

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
	nsmarty.clearCache();
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
