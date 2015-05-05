"use strict";
var fs = require('fs');

module.exports = ConfigLoader;
function ConfigLoader(){
	
}

ConfigLoader.prototype.load_environment = function (file, req){
	var fName = APPPATH + 'config/environment/' + file + '.json';
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
};
ConfigLoader.prototype.load_server = function (file, req){
	var fName = APPPATH + 'config/server/' + file + '.json';
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
};

function deep_extend(to, from){
	for(var n in from){
		if(typeof n == 'object'){
			if(!to[n]){
				to[n] = {};
			}
			deep_extend(to[n], from[n]);
		} else{
			to[n] = from[n];
		}
	}
	return to;
}
