#!/usr/bin/env node
module.paths.push(process.cwd() + "/node_modules");

var path = require('path'),
		fs = require('fs'),
		extend = require('util')._extend;

if(!require('./scripts/check_version.js')){
	return;
}

var confirm_module = require('./scripts/pure_install.js').confirm;
console.assert(confirm_module('colors/safe', 'colors'), '安装失败，请尝试手动安装');
console.assert(confirm_module('promise'), '安装失败，请尝试手动安装');

var colors = global.colors = require('colors/safe');

var CAPPPATH = global.CAPPPATH = ''; // 项目路径

var APPPATH = global.APPPATH = process.cwd().replace(/\\/g, '/') + '/'; // 项目路径 - 运行时
var CLOUDROOT = global.CLOUDROOT = 'cloud/'; // 云代码带AV对象的路径（就是 cloud/）

var CGROOT = global.CGROOT = __dirname.replace(/\\/g, '/') + '/'; // 框架存放路径
var GROOT = global.GROOT = 'cloud/lean-g/'; // 框架存放路径 - 运行时

console.log('LEAN-G: set CGROOT = %s', CGROOT);
console.log('LEAN-G: set APPPATH = %s', APPPATH);

var config_exists = fs.existsSync(APPPATH + 'config');

var initfunc = process.argv[2];
if(!initfunc){
	usage("no command spec.");
}

// 解析package.json
global.deploySettings = require('./scripts/deploy_helper/deploy_settings');
deploySettings.commit();

// 防止多进程同时启动
global.singleInstance = require('./scripts/deploy_helper/single_instance');
singleInstance.start(real_run);

function exitHandler(options, err){
	if(global.preventExit){
		global.preventExit = false;
		return;
	}
	if(options.cleanup){
		singleInstance.stop();
		deploySettings.delete_package_json();
	}
	if(options.error){
		console.log(err.stack || err.message || err);
		process.exit(1);
	}
	if(options.exit){
		process.exit(err);
	}
}
exitHandler.exit = exitHandler.bind(null, {exit: true});
exitHandler.clean_exit = exitHandler.bind(null, {cleanup: true});

process.on('uncaughtException', exitHandler.bind(null, {error: true}));
process.on('exit', exitHandler.clean_exit);
process.on('SIGINT', exitHandler.exit);
setImmediate(function (){ // 初始化过程结束后，把清理环境监听器放到最后
	process.removeListener('exit', exitHandler.clean_exit);
	process.removeListener('SIGINT', exitHandler.exit);
	process.on('exit', exitHandler.clean_exit);
	process.on('SIGINT', exitHandler.exit);
});

// 处理特殊命令（这些命令没有环境）
if(initfunc == 'init'){
	require('./scripts/copy_init_app_struct.js');
	return;
}
if(initfunc == 'dependence'){
	require('./scripts/resolve_dependence.js');
	return;
}
if(initfunc == 'config'){
	require('./scripts/create_application.js');
	return;
}

var command = process.argv[3];
if(!command){
	usage("no command spec.");
}

// 确定运行过init
if(!config_exists){
	usage("config folder not exists");
}

// 检查要运行的命令文件
var command_file = CGROOT + 'scripts/commands/' + command + '.js';
if(!fs.existsSync(command_file)){
	usage("command file not exists: " + command_file + ".");
}

// 预备运行文件夹和环境
process.env.HOME = global.HOME = APPPATH + '.avoscloud';
process.chdir(APPPATH);
if(!fs.existsSync('.avoscloud')){
	fs.mkdirSync('.avoscloud');
}

// 读取avos配置
global.APP_TYPE = process.argv[2];
global.APP_NAME = 'LG-' + APP_TYPE; // 用来给avoscloud-code执行文件使用
var cfile = APPPATH + 'config/' + APP_TYPE + '.json';
if(!fs.existsSync(cfile)){
	console.error('config file not found: ' + cfile);
	process.exit(-1);
}

var APP_CONFIG = {};

var dcfile = APPPATH + 'config/default.json';
if(fs.existsSync(dcfile)){
	extend(APP_CONFIG, JSON.parse(fs.readFileSync(dcfile)));
}
extend(APP_CONFIG, JSON.parse(fs.readFileSync(cfile)));
global.APP_CONFIG = APP_CONFIG;

global.update = require(CGROOT + 'scripts/avos_config');

/* real run !! */
function real_run(){
	global.update.everything();
	require(command_file);
}

/* support functions */
function usage(text){
	console.error(colors.rainbow('The G Framework - LeanCloud -\n'));
	console.error('' + text + ' ');
	
	if(!config_exists){
		console.error('  Use `' + process.argv[1] + ' init [dir]` to start a new application.');
		process.exit(1);
	}
	
	console.error('Usage: ' + process.argv[0] + ' ' + path.basename(process.argv[1]) + ' config-file command');
	console.error('');
	
	console.error('Available Config File:');
	fs.readdirSync(APPPATH + 'config').filter(function (n){
		return n.substr(0, 1) != '.' && n != 'global.json' && n != 'config.json' && n != 'default.json';
	}).forEach(function (f){
		try{
			var appname = require(APPPATH + 'config/' + f).applicationName;
		} catch(e){
			appname = '配置文件无法解析!!';
		}
		console.error('\t' + colors.green(path.basename(f, '.json')) + ' - ' + appname);
	});
	console.error('');
	
	console.error('Available Command:');
	require('fs').readdirSync(CGROOT + 'scripts/commands').filter(function (n){
		return n.substr(0, 1) != '.';
	}).map(function (f){
		var content = fs.readFileSync(CGROOT + 'scripts/commands/' + f);
		var title = /@title: (.*)/.exec(content);
		title = title? title[1] : '???';
		console.error('\t' + colors.green(path.basename(f, '.js')) + ' - ' + title);
	});
	
	process.exit(1);
}
