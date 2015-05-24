"use strict";

var APPPATH = global.APP_PATH;
var fs = require('fs');
var extend = require('util')._extend;
var require_missing = require('../../include/require_missing');

/* settings json */
if(fs.existsSync(APPPATH + 'settings.json')){
	global.LeanParams = require(APPPATH + 'settings.json');
} else{
	global.LeanParams = {};
}
if(!LeanParams.deploy){
	LeanParams.deploy = [];
}

module.exports.set = function (name, value){
	LeanParams[name] = value;
};
module.exports.upload = function (data){
	if(typeof data === 'string'){
		data = {
			"src"     : [data + "/**"],
			"symlinks": [data]
		};
	}
	LeanParams.deploy.push(data);
};

/* package json */
global.PackageJson = {};
if(fs.existsSync(APPPATH + 'package.proto.json')){
	var pkg = fs.readFileSync(APPPATH + 'package.proto.json', 'utf-8');
	try{
		eval('global.PackageJson=' + pkg);
	} catch(e){
		console.error('无法解析package.proto.json:\n\n' + e.stack);
		process.exit(-1);
	}
} else if(fs.existsSync(APPPATH + 'package.json')){
	try{
		global.PackageJson = JSON.parse(fs.readFileSync(APPPATH + 'package.json', 'utf-8'));
	} catch(e){
		console.error('无法解析package.json:\n\n' + e.stack);
		process.exit(-1);
	}
	fs.writeFileSync(APPPATH + 'package.proto.json', butify_encode_json(global.PackageJson));
} else{
	console.error('没有找到 package.proto.json \n');
}

module.exports.getApplicationName = function (){
	return PackageJson.description;
};
module.exports.readDependenceList = function (incudeDevDep){
	var deps = {};
	if(PackageJson.dependencies){
		extend(deps, PackageJson.dependencies);
	}
	if(incudeDevDep && PackageJson.devDependencies){
		extend(deps, PackageJson.devDependencies);
	}
	return deps;
};

module.exports.ensureDependence = function (incudeDevDep){
	var deps = module.exports.readDependenceList(incudeDevDep);
	deps = Object.keys(deps);
	
	var traceLimit = Error.stackTraceLimit;
	Error.stackTraceLimit = 5;
	
	var oklist = [];
	try{
		deps.forEach(function (name){
			require(name);
			oklist.push(name);
		});
	} catch(e){
		console.log('\x1B[38;5;10m检查模块成功：%s.\x1B[0m', oklist.join(', '));
		var recommend = require_missing.recommand_solutions(require_missing.parse_require_error_stack(e.stack));
		if(!recommend){
			console.error(e.stack);
		}
		process.exit(9);
	}
	Error.stackTraceLimit = traceLimit;
};
module.exports.checkUnusedDependence = function (){
	var internalModules = [
		'.bin',
		'lean-g',
		'avoscloud-code',
		'chokidar',
		'colors',
		'less-middleware',
		'nsmarty',
		'phpjs',
		'promise',
		'repl.history',
		'serve-favicon'
	];
	var mdllist = fs.readdirSync(APPPATH + 'node_modules').filter(function (name){
		if(PackageJson.devDependencies && PackageJson.devDependencies[name]){
			return false;
		}
		if(PackageJson.dependencies && PackageJson.dependencies[name]){
			return false;
		}
		return internalModules.indexOf(name) == -1;
	});
	
	if(mdllist.length == 0){
		return true;
	} else{
		console.log('\n本地存在以下模块，在package.proto.json中没有定义\n如果确实使用了它们，则必须添加到package.proto.json中\n如果没有使用，就应该删除\n\n\t\x1B[38;5;9m%s\x1B[0m\n', mdllist.join(', '));
		return false;
	}
};

module.exports.commit = function (){
	fs.writeFileSync(APPPATH + '/.avoscloud/deploy.json', JSON.stringify(LeanParams, null, 8));
	fs.writeFileSync(APPPATH + 'package.json', JSON.stringify(PackageJson, null, 8).replace(/^        /mg, '\t'));
};

module.exports.delete_package_json = function (){
	if(fs.existsSync(APPPATH + 'package.json')){
		fs.unlinkSync(APPPATH + 'package.json');
	}
};

module.exports.configure = function (config){
	config.package = PackageJson;
	config.lean = LeanParams;
};

function butify_encode_json(obj){
	return JSON.stringify(obj, null, 8).replace(/^        /mg, '\t')
}
