"use strict";
var fs = require('fs');
var extend = require('util')._extend;

module.exports = ConfigLoader;
function ConfigLoader(configPath){
	this.configPath = configPath;
	this.state = {
		environment: [],
		server     : []
	}
}

ConfigLoader.prototype.load_environment = function (file, req){
	var fName = this.configPath + 'environment/' + file + '.json';
	if(!fs.existsSync(fName)){
		if(req){
			console.error('所需的配置文件没有找到（这个文件是：%s）', fName);
			process.exit(10);
		} else{
			return;
		}
	}
	console.log('加载环境配置 [%s]', file);
	deep_extend(this, JSON.parse(fs.readFileSync(fName)));
	this.state.environment.push(file);
};
ConfigLoader.prototype.load_server = function (file, req){
	var fName = this.configPath + 'server/' + file + '.json';
	if(!fs.existsSync(fName)){
		if(req){
			console.trace('所需的配置文件没有找到（这个文件是：%s）', fName);
			process.exit(10);
		} else{
			return;
		}
	}
	console.log('加载服务器配置 [%s]', file);
	deep_extend(this, JSON.parse(fs.readFileSync(fName)));
	this.state.server.push(file);
};
ConfigLoader.prototype.load_global = function (){
	var fName = this.configPath + 'global.json';
	if(fs.existsSync(fName)){
		deep_extend(this, JSON.parse(fs.readFileSync(fName)));
	}else{
		throw new Error('no configure file');
	}
};
ConfigLoader.prototype.write_global = function (){
	var config = extend({}, this);
	delete config.configPath;
	fs.writeFileSync(this.configPath + 'global.json', JSON.stringify(config));
};

function deep_extend(to, from){
	for(var n in from){
		if(!from.hasOwnProperty(n)){
			continue;
		}
		var v = from[n];
		if(Array.isArray(v)){
			to[n] = v.slice();
		} else if(typeof v == 'object'){
			if(!to[n]){
				to[n] = {};
			}
			deep_extend(to[n], v);
		} else{
			to[n] = v;
		}
	}
	return to;
}
