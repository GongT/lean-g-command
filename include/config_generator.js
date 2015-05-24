var fs = require('fs');
var path = require('path');
var basename = require('path').basename;

var APPPATH = global.APP_PATH;

var GENPATH = APPPATH + 'cloud/__gen/';
var extend = require('util')._extend;

var avosInternalDataBase = ['user', 'cloudlog', 'file', 'followee', 'follower', 'installation', 'notification', 'role'];
var avosInternalDataBaseMap = {'cloudlog': 'cloud_log'};

if(!fs.existsSync(GENPATH)){
	fs.mkdirSync(GENPATH);
}

function ucfirst(s){
	return s.replace(/^[a-z]/, function (a){
		return a.toUpperCase();
	});
}

function windows_style(name){
	return name.replace(/_[a-z]/g, function (v){
		return v.substr(1).toUpperCase();
	});
}

var jsJsFile = /\.js$/;
function notJsFile(f){
	return !jsJsFile.test(f);
}
function isJsFile(f){
	return jsJsFile.test(f);
}

function class_name(name){
	if(avosInternalDataBase.indexOf(name.toLowerCase()) == -1){
		return ucfirst(windows_style(name));
	} else{
		if(avosInternalDataBaseMap[name.toLowerCase()]){
			name = avosInternalDataBaseMap[name.toLowerCase()];
		}
		return '_' + ucfirst(name);
	}
}

function map_back(name){
	return name.replace(/^_/, '');
}

/**/
function update_avos_config(){
}

function deepReadDirSync(dir){
	var result = [];
	if(!fs.existsSync(dir)){
		return result;
	}
	dir = path.resolve(dir) + '/';
	var base = dir;
	read(dir, '');
	return result;
	
	function read(prepend, dir){
		if(dir && !/[\/\\]$/.test(dir)){
			dir += '/';
		}
		console.log('read %s', prepend, dir);
		fs.readdirSync(prepend + dir).forEach(function (f){
			if(fs.lstatSync(prepend + dir + f).isDirectory()){
				read(prepend + dir, f);
			} else{
				result.push(prepend.replace(base, '') + dir + f);
			}
		});
	}
}

function read_module_folder(basepath, types){
	var data = {};
	for(var i in types){
		var type = types[i];
		if(fs.existsSync(APPPATH + basepath + type) && fs.lstatSync(APPPATH + basepath + type).isDirectory()){
			data[type] = {};
			fs.readdirSync(APPPATH + basepath + type).filter(isJsFile).forEach(function (f){
				var n = basename(f, '.js');
				data[type][n] = basepath + type + '/' + f;
			});
		}
	}
	return data;
}

function update_avos_module(){
	console.log('更新配置...');
	var APP_CONFIG = global.APP_CONFIG;
	APP_CONFIG.APP_ENVIRONMENT = APP_ENVIRONMENT;
	APP_CONFIG.APP_SERVER = global.APP_SERVER;
	
	APP_CONFIG.load_environment('default', false);
	APP_CONFIG.load_environment(APP_ENVIRONMENT, true);
	
	APP_CONFIG.load_server('default', false);
	APP_CONFIG.load_server(global.APP_SERVER, true);
	var APP_NAME = 'LG-' + APP_ENVIRONMENT + '-' + global.APP_SERVER;

// 配置文件
	console.log('\t复制配置文件...');
	global.deploySettings.configure(APP_CONFIG);
	APP_CONFIG.write_global();

// CurrentApp
	console.log('\t设置当前 app-id...');
	fs.writeFileSync(APPPATH + '.avoscloud/curr_app', APP_NAME);

// 应用列表
	var appList = {};
	appList[APP_NAME] = APP_CONFIG['applicationId'];
	console.log('\t写入app list...');
	fs.writeFileSync(APPPATH + '.avoscloud/apps.json', JSON.stringify(appList));

// MasterKey
	var keyConf = {};
	keyConf[APP_CONFIG['applicationId']] = APP_CONFIG['masterKey'];
	console.log('\t写入app key...');
	fs.writeFileSync(APPPATH + '.avoscloud/.avoscloud_keys', JSON.stringify(keyConf));
}

function update_avos_express(){
}

function update_avos_library(){
}

function read_tree(dir){
	var ret = {};
	var hidden = /^\./;
	if(!fs.existsSync(APPPATH + dir)){
		return {};
	}
	fs.readdirSync(APPPATH + dir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(!fs.existsSync(dir + f) || fs.lstatSync(dir + f).isDirectory()){
			ret[basename(f, '.js')] = read_tree(dir + f + '/');
		} else if(isJsFile(f)){
			ret[basename(f, '.js')] = dir + f;
		}
	});
	return ret;
}

function update_avos_function(){
}

function update_avos_trigger(){
}

function update_error_number(){
}

module.exports.config = update_avos_config;
module.exports.errno = update_error_number;
module.exports.everything = function (){
	module.exports.config();
	module.exports.errno();
	// 所有载入器
	module.exports.source();
};

module.exports.function = update_avos_function;
module.exports.library = update_avos_library;
module.exports.module = update_avos_module;
module.exports.trigger = update_avos_trigger;
module.exports.express = update_avos_express;
module.exports.source = function (){
	module.exports.function();
	module.exports.library();
	module.exports.module();
	module.exports.trigger();
	module.exports.express();
};
