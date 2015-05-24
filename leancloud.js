#!/usr/bin/env node
"use strict";
var path = require('path'),
		fs = require('fs'),
		extend = require('util')._extend;

if(!require('./scripts/check_version.js')){
	return;
}
console.error('LEAN-G: nodejs.version = ' + process.version);
process.env.LEANG_LOCALHOST = 'yes';

var confirm_module = require('./scripts/pure_install').confirm;
console.assert(confirm_module('colors/safe', 'colors'), '安装失败，请尝试手动安装');
console.assert(confirm_module('promise'), '安装失败，请尝试手动安装');
console.assert(confirm_module('chokidar'), '安装失败，请尝试手动安装');

var colors = global.colors = require('colors/safe');

var APP_PATH = global.APP_PATH = process.cwd().replace(/\\/g, '/') + '/'; // 项目路径 - 运行时
global.CLOUD_DIR = 'cloud/'; // 云代码带AV对象的路径（就是 cloud/）

var LEANG_PATH = global.LEANG_PATH = __dirname.replace(/\\/g, '/') + '/'; // 框架存放路径

console.log('LEAN-G: LEANG_PATH = %s', LEANG_PATH);
console.log('LEAN-G: APP_PATH = %s', APP_PATH);

var config_exists = fs.existsSync(APP_PATH + 'config');

// 检查alias
var alias = require('./scripts/init_commands/command_alias');
if(process.argv.length == 3){
	alias.load();
}
if(process.argv.length == 4){
	require('./scripts/back_comp');
}

var action = assert_process_argument(2, usage, '缺少命令');

// 解析package.json
global.deploySettings = require('./scripts/deploy_helper/deploy_settings');

// 防止多进程同时启动
global.singleInstance = require('./scripts/deploy_helper/single_instance');

// 处理命令行工具启动过程中的错误
require('./scripts/leang_errorhandler');

// 处理特殊命令（这些命令没有环境）
if(action == 'init'){
	return require('./scripts/init_commands/copy_init_app_struct.js');
}
if(action == 'dependence'){
	return require('./scripts/init_commands/resolve_dependence.js');
}
if(action == 'config'){
	console.error('this command has not been written.');
	return;// require('./scripts/init_commands/create_application.js');
}

// 确定运行过init
if(!config_exists){
	usage("没有找到config文件夹 - 可能当前目录错误");
}

// 预备运行文件夹和环境
process.env.HOME = global.HOME = APP_PATH + '.avoscloud/';
process.chdir(APP_PATH);
if(!fs.existsSync('.avoscloud')){
	fs.mkdirSync('.avoscloud');
}
process.env.TMPDIR = path.resolve(APP_PATH, '.avoscloud/deploy_packages');
if(fs.existsSync(process.env.TMPDIR)){
	fs.readdirSync(process.env.TMPDIR).forEach(function (file){
		if(/[0-9]+\.zip/.test(file)){
			fs.unlinkSync(process.env.TMPDIR + '/' + file);
		}
	});
} else{
	fs.mkdirSync(process.env.TMPDIR);
}

if(action == 'alias'){
	return require('./scripts/init_commands/command_alias').save();
}

// 检查要运行的命令文件
var command_file = LEANG_PATH + 'scripts/commands/' + action + '.js';
if(!fs.existsSync(command_file)){
	return usage_cmd("未知命令: " + action + ".");
}

// 读取avos配置
global.APP_CONFIG = new (require('./include/ConfigLoader'))(APP_PATH + 'config/');
APP_CONFIG.load_environment('default', false);

global.APP_ENVIRONMENT = assert_process_argument(3, usage_environment, '缺少环境定义文件');
if(APP_ENVIRONMENT != 'default'){
	APP_CONFIG.load_environment(APP_ENVIRONMENT, true);
}

global.update = require('./include/config_generator');
global.APP_SERVER = assert_process_argument(4, usage_server, '缺少服务器定义文件');
APP_CONFIG.load_server(global.APP_SERVER, true);

singleInstance.start(real_run);

/* real run !! */
function real_run(){
	deploySettings.commit();
	process.on('exit', function (){
		deploySettings.delete_package_json();
	});
	
	var content = fs.readFileSync(command_file, 'utf8');
	var action = /@windowTitle: (.*)/.exec(content);
	action = action? action[1] : '不知作甚';
	
	process.stdout.write('\x1B]0;正在' + action + '：' + deploySettings.getApplicationName() + '（' +
	                     APP_CONFIG.environmentName + '@' + APP_CONFIG.serverName + '）' + '\x07');
	global.update.everything();
	require(command_file);
}

/* support functions */
function usage(text){
	console.error(colors.rainbow('The G Framework - LeanCloud -\n'));
	console.error('\t\x1B[38;5;9m' + text + '\x1B[0m');
	
	if(!config_exists){
		console.error('　使用 `leang init [dir]`创建新应用.');
		process.exit(1);
	}
	
	console.error('使用 leang 命令 环境文件名 服务器文件名');
	console.error('　或 leang 别名');
	console.error('');
	
	usage_environment();
	console.error('');
	
	usage_server();
	console.error('');
	
	usage_cmd();
	
	process.exit(1);
}
function usage_cmd(text){
	if(text){
		console.error('使用 leang 命令 环境文件名 服务器文件名');
		console.error('\x1B[38;5;9mError:\n\t' + text + '\x1B[0m');
	}
	
	console.error('命令列表:');
	require('fs').readdirSync(LEANG_PATH + 'scripts/commands').filter(function (n){
		return n.substr(0, 1) != '.';
	}).map(function (f){
		var content = fs.readFileSync(LEANG_PATH + 'scripts/commands/' + f);
		var title = /@title: (.*)/.exec(content);
		title = title? title[1] : '???';
		console.error('\t' + colors.green(path.basename(f, '.js')) + ' - ' + title);
	});
	console.error('');
	console.error('\t' + colors.green('dependence') + ' - 解决依赖');
	console.error('\t' + colors.green('config') + ' - 建立/调整配置文件');
	console.error('');
}
function usage_environment(text){
	if(text){
		console.error('使用 leang 命令 环境文件名 服务器文件名');
		console.error('\x1B[38;5;9mError:\n\t' + text + '\x1B[0m');
	}
	if(!fs.existsSync(APP_PATH + 'config/environment')){
		fs.mkdirSync(APP_PATH + 'config/environment');
	}
	console.error('可用环境:');
	fs.readdirSync(APP_PATH + 'config/environment').filter(function (n){
		return n.substr(0, 1) != '.' && n != 'default.json';
	}).forEach(function (f){
		try{
			var envName = JSON.parse(fs.readFileSync(APP_PATH + 'config/environment/' + f)).environmentName;
		} catch(e){
			envName = '配置文件无法解析 - ' + e.message;
		}
		console.error('\t' + colors.green(path.basename(f, '.json')) + ' - ' + envName);
	});
}

function usage_server(){
	console.error('可用服务器:');
	if(!fs.existsSync(APP_PATH + 'config/server')){
		fs.mkdirSync(APP_PATH + 'config/server');
	}
	fs.readdirSync(APP_PATH + 'config/server').filter(function (n){
		return n.substr(0, 1) != '.';
	}).forEach(function (f){
		try{
			var serverName = JSON.parse(fs.readFileSync(APP_PATH + 'config/server/' + f)).serverName;
		} catch(e){
			serverName = '配置文件无法解析 - ' + e.message;
		}
		console.error('\t' + colors.green(path.basename(f, '.json')) + ' - ' + serverName);
	});
}

function assert_process_argument(i, usage, msg){
	if(!process.argv[i]){
		usage(msg);
		process.exit(1);
	}
	return process.argv[i];
}
