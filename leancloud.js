#!/usr/bin/env node

var path = require('path'),
		fs = require('fs'),
		extend = require('util')._extend;
var ROOT = global.ROOT = __dirname + '/';
var APPPATH = global.APPPATH = process.cwd() + '/';

var config_exists = fs.existsSync(APPPATH + 'config');

var initfunc = process.argv[2];
if(!initfunc){
	usage("no command spec.");
}

// 处理特殊命令（这些命令没有环境）
if(initfunc == 'init'){
	require('./scripts/copy_init_app_struct.js');
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
var command_file = ROOT + 'scripts/commands/' + command + '.js';
if(!fs.existsSync(command_file)){
	usage("command file not exists: " + command_file + ".");
}

// 防止多进程同时启动
if(fs.existsSync(APPPATH + '.runlock')){
	console.error('另一个进程正在运行，这样做可能导致数据不同步（尤其上传代码时）。\n如果上次崩溃退出，那么删除 .runlock 文件重试。');
	process.exit(-1);
}
var flock = fs.openSync(APPPATH + '.runlock', 'w');
fs.write(flock, process.pid.toString(), process.pid.toString().length);
function exitHandler(options, err){
	if(options.cleanup){
		fs.close(flock);
		fs.unlinkSync(APPPATH + '.runlock', 'w')
	}
	if(err){
		console.log(err.stack);
	}
	if(options.exit){
		process.exit();
	}
}
exitHandler.exit = exitHandler.bind(null, {exit: true});
exitHandler.clean_exit = exitHandler.bind(null, {cleanup: true});

process.on('uncaughtException', exitHandler.exit);
process.on('exit', exitHandler.clean_exit);
process.on('SIGINT', exitHandler.exit);
setImmediate(function (){
	process.removeListener('exit', exitHandler.clean_exit);
	process.removeListener('SIGINT', exitHandler.exit);
	process.on('exit', exitHandler.clean_exit);
	process.on('SIGINT', exitHandler.exit);
});

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
	extend(APP_CONFIG, require(dcfile));
}
extend(APP_CONFIG, require(cfile));
global.APP_CONFIG = APP_CONFIG;

global.update = require(ROOT + 'scripts/avos_config');

/* real run !! */
global.update.everything();
require(command_file);

/* support functions */
function usage(text){
	var s = 'The G Framework - LeanCloud -';
	for(var i = 0; i < s.length; i++){
		var c = (i%13 + 1);
		if(c == 4){
			c = 255;
		}
		process.stderr.write('\x1B[38;5;' + c + 'm' + s[i]);
	}
	process.stderr.write('\x1B[0m\n\t');
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
		console.error('\t\x1B[38;5;10m' + path.basename(f, '.json') + '\x1B[0m - ' + appname);
	});
	console.error('');
	
	console.error('Available Command:');
	require('fs').readdirSync(ROOT + 'scripts/commands').filter(function (n){
		return n.substr(0, 1) != '.';
	}).map(function (f){
		var content = fs.readFileSync(ROOT + 'scripts/commands/' + f);
		var title = /@title: (.*)/.exec(content);
		title = title? title[1] : '???';
		console.error('\t\x1B[38;5;10m' + path.basename(f, '.js') + '\x1B[0m - ' + title);
	});
	
	process.exit(1);
}
