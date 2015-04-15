var fs = require('fs');
var path = require('path');
var basename = require('path').basename;

var APPPATH = global.APPPATH;
var CGROOT = global.CGROOT;
var GROOT = global.GROOT;

var CLOUDROOT = global.CLOUDROOT;
var APP_CONFIG = global.APP_CONFIG;
var APP_NAME = global.APP_NAME;
var APP_TYPE = global.APP_TYPE;
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
	console.log('更新配置...');
	// CurrentApp
	console.log('\t设置当前 app-id...');
	fs.writeFileSync(APPPATH + '.avoscloud/curr_app', APP_NAME);
	
	// 配置文件
	console.log('\t复制配置文件...');
	fs.writeFileSync(APPPATH + 'config/global.json', JSON.stringify(APP_CONFIG));
	global.deploySettings.configure(APP_CONFIG);
	fs.writeFileSync(GENPATH + 'config.js', 'module.exports = ' + JSON.stringify(APP_CONFIG));
	
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
	
	// less-constants
	
	var PUB_CONST = {
		IS_DEBUG_ENV  : APP_CONFIG.isDebugEnv,
		isDebugEnv    : APP_CONFIG.isDebugEnv,
		ENVIRONMENT   : APP_TYPE,
		STATIC_URL    : APP_CONFIG.staticUrl,
		BASE_URL      : APP_CONFIG.baseUrl,
		STATIC_VERSION: APP_CONFIG.staticVersion
	};
	var LESS_CONST = extend(APP_CONFIG.styleConstant || {}, PUB_CONST);
	var JS_CONST = extend(APP_CONFIG.scriptConstant || {}, PUB_CONST);
	var lc = '';
	Object.keys(LESS_CONST).forEach(function (key){
		lc += '@' + key + ': "' + LESS_CONST[key] + '";\n';
	});
	fs.writeFileSync(GENPATH + 'import.jsconst.js', 'module.exports = ' + JSON.stringify(JS_CONST) + ';');
	fs.writeFileSync(APPPATH + 'public/less-constants.less', lc);
}

function read_proto_folder(){
	var data = {};
	['static', 'property'].forEach(function (type){
		var path = GROOT + 'database_proto/' + type;
		data[type] = {};
		fs.readdirSync(path).filter(isJsFile).forEach(function (f){
			var n = basename(f, '.js');
			data[type][n] = GROOT + 'database_proto/' + type + '/' + f;
		});
	});
	return data;
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
	console.log('生成数据模型载入文件...');
	var source = [];
	
	var prototype = read_proto_folder();
	if(Object.keys(prototype).length){
		source.push('AV.CLS._prototype.extend(' + JSON.stringify(prototype, null, 8) + ');');
	}
	
	/* 数据模型、基本组件 */
	if(fs.existsSync(APPPATH + 'cloud/database/_proto_') &&
	   fs.lstatSync(APPPATH + 'cloud/database/_proto_').isDirectory()){
		prototype = read_module_folder('cloud/database/_proto_/', ['static', 'property']);
		if(Object.keys(prototype).length){
			source.push('AV.CLS._prototype.extend(' + JSON.stringify(prototype, null, 8) + ');');
		}
	}
	
	fs.readdirSync(APPPATH + 'cloud/database').forEach(function (f){
		var base = APPPATH + 'cloud/database/' + f + '/';
		var basepath = 'cloud/database/' + f + '/';
		if(/^(\.|_)/.test(f) || !fs.existsSync(base) || !fs.lstatSync(base).isDirectory()){
			return;
		}
		var database = class_name(basename(f));
		console.log('\t模型：' + database);
		var datadef = read_module_folder(basepath, ['static', 'property']);
		if(fs.existsSync(base + f + '.js') && fs.lstatSync(base + f + '.js').size > 3){
			datadef.constants = basepath + f + '.js';
		}
		source.push('AV.CLS.' + map_back(database) + ' = AV.CLS("' + database + '", "' + basepath +
		            '", ' + JSON.stringify(datadef, null, 8) + ');');
	});
	
	fs.writeFileSync(GENPATH + 'import.modules.js', source.join("\n"));
}

function update_avos_express(){
	console.log('生成HTTP服务文件...');
	var source = [];
	
	var controllers = read_tree('cloud/controllers/');
	source.push('AV.ExpressController.parse(' + JSON.stringify(controllers, null, 8) + ');');
	fs.writeFileSync(GENPATH + 'import.express.js', source.join("\n"));
	
	var vflist = {};
	fs.readdirSync(CGROOT + 'view_functions').filter(isJsFile).forEach(function (f){
		vflist[basename(f, '.js')] = GROOT + 'view_functions/' + f;
	});
	if(fs.existsSync(CLOUDROOT + 'view_functions')){
		fs.readdirSync(CLOUDROOT + 'view_functions').filter(isJsFile).forEach(function (f){
			vflist[basename(f, '.js')] = CLOUDROOT + 'view_functions/' + f;
		});
	}
	var arr = Object.keys(vflist).map(function (k){
		return vflist[k];
	});
	fs.writeFileSync(GENPATH + 'import.nsmarty.js', 'module.exports = ' + JSON.stringify(arr, null, 8) + ';');
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
	console.log('生成云代码载入文件...');
	var source = [];
	
	/* 客户端用的云代码 */
	deepReadDirSync(APPPATH + 'cloud/functions').filter(isJsFile).forEach(function (f){
		var base = f.replace(/\.js$/, '');
		var internal = base.replace(/\/|\\/g, '_');
		var name = base.replace(/\/|\\/g, '::');
		if(base == name){
			console.log('\t云代码：%s', name);
		} else{
			console.log('\t云代码：%s -> %s', base, name);
		}
		source.push('AV.Cloud.define("' + name + '", AV.Cloud.' + internal + ' = require("cloud/functions/' + f +
		            '"));');
	});
	
	/* 调试用的云代码 */
	if(APP_CONFIG['isDebugEnv']){
		if(fs.existsSync((APPPATH + 'cloud/functions-debug'))){
			fs.readdirSync(APPPATH + 'cloud/functions-debug').filter(isJsFile).forEach(function (f){
				console.log('\t测试函数：' + f);
				source.push('AV.Cloud.define("__' + basename(f, '.js') + '", AV.Cloud.__' + basename(f, '.js') +
				            ' = require("cloud/functions-debug/' + f + '"));');
			});
		}
	}
	
	fs.writeFileSync(GENPATH + 'import.functions.js', source.join("\n"));
}

function update_avos_trigger(){
	console.log('生成触发器载入文件...');
	var source = [];
	
	/* 触发器 */
	var triggers = {};
	fs.readdirSync(APPPATH + 'cloud/database').forEach(function (f){
		var base = APPPATH + 'cloud/database/' + f + '/';
		var basepath = 'cloud/database/' + f + '/';
		if(!fs.existsSync(base) || !fs.lstatSync(base).isDirectory() || f.indexOf('_') == 0){
			return;
		}
		var database = class_name(basename(f));
		var datadef = read_module_folder(basepath, ['trigger']).trigger;
		if(!datadef){
			return;
		}
		var result = {};
		var map = {
			afterSave  : 'post-insert',
			afterUpdate: 'post-update',
			beforeSave : 'before-insert'
		};
		for(var fn in map){
			var dn = map[fn];
			if(datadef[dn]){
				result[fn] = datadef[dn];
				delete datadef[dn];
			}
		}
		if(Object.keys(datadef).length){
			console.error('未知触发器类型：', Object.keys(datadef).join(''));
			console.log(map);
			throw new Error('未知触发器类型：', Object.keys(datadef).join(''));
		}
		
		if(Object.keys(result).join('')){
			console.log('\t触发器：%s -- %s', database, Object.keys(result).join(','));
			source.push('AV.CLS.' + map_back(database) + '.registerTrigger(' + JSON.stringify(result, null, 8) + ');');
		}
	});
	
	if(fs.existsSync(APPPATH + 'cloud/timers')){
		/* 定时器 */
		source.push('AV.Timer = {};');
		fs.readdirSync(APPPATH + 'cloud/timers').filter(isJsFile).forEach(function (f){
			console.log('\t定时器：' + basename(f, '.js'));
			source.push('AV.Cloud.define("' + basename(f, '.js') + '", AV.Timer.' + basename(f, '.js') +
			            ' = require("cloud/timers/' + f + '"));');
		});
	}
	
	fs.writeFileSync(GENPATH + 'import.triggers.js', source.join("\n"));
}

function update_debug(){
	console.log('更新代码补全...');
	var scripts = '';
	scripts += 'global.APP_CONFIG = ' + JSON.stringify(APP_CONFIG, null, 8);
	scripts += 'global.APP_NAME = ' + JSON.stringify(APP_NAME, null, 8);
	
	fs.writeFileSync(GENPATH + 'debug.js', scripts);
}

function update_error_number(){
	console.log('生成错误码js文件...');
	var em = require(APPPATH + 'errormessage.json');
	var last_code = -1;
	var script = [];
	em.forEach(function (item){
		var code, name, message;
		if(typeof item[0] == 'number'){
			if(last_code >= code){
				throw new Error('错误的错误码顺序');
			}
			last_code = code = item.shift();
		} else{
			code = ++last_code;
		}
		name = item[0];
		message = item[1];
		
		script.push('module.exports.' + name + ' = AV.ApiError.create(' + code + ',' + JSON.stringify(name) +
		            ',' + JSON.stringify(message) + ');');
	});
	
	fs.writeFileSync(GENPATH + 'error.js', script.join('\n'));
}

module.exports.debug = update_debug;
module.exports.config = update_avos_config;
module.exports.errno = update_error_number;
module.exports.everything = function (){
	module.exports.config();
	module.exports.debug();
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
