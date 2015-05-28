"use strict";
var path = require('path'),
		fs = require('fs'),
		extend = require('util')._extend;

process.env.LEANG_LOCALHOST = 'true';

if(!require('../lib/check_version')){
	console.error('LEAN-G: current nodejs.version = ' + process.version);
	return;
}
console.log('LEAN-G: nodejs.version = ' + process.version);

global.LEAN_G_INSTALL_FROM = 'git@git.coding.net/GongT/';
var confirm_module = require('../lib/npm_installer').confirm;
console.assert(confirm_module('lean-g-core-classes', 'lean-g-core-classes.git'), '安装失败，请尝试手动安装');
console.assert(confirm_module('colors/safe', 'colors'), '安装失败，请尝试手动安装');
console.assert(confirm_module('promise'), '安装失败，请尝试手动安装');
console.assert(confirm_module('chokidar'), '安装失败，请尝试手动安装');

global.CORE = require('lean-g-core-classes');
global.CORE_PATH = CORE.path;

var colors = global.colors = require('colors/safe');

var APP_PATH = global.APP_PATH = process.cwd().replace(/\\/g, '/') + '/'; // 项目路径 - 运行时
var LEANG_PATH = global.LEANG_PATH = path.resolve(__dirname.replace(/\\/g, '/'), '..') + '/'; // 框架存放路径
var CONFIG_PATH = global.CONFIG_PATH = APP_PATH + 'include/config/';

console.log('LEAN-G: APP_PATH = %s', APP_PATH);
console.log('LEAN-G: LEANG_PATH = %s', LEANG_PATH);
console.log('LEAN-G: CORE_PATH = %s', CORE_PATH);

var config_exists = fs.existsSync(CONFIG_PATH);

// 检查alias
var alias = require('./command_alias');
if(process.argv.length == 3){
	alias.load();
}

var action = assert_process_argument(2, usage, '缺少命令');

// 解析package.json
global.deploySettings = CORE.helper.DeploySettings;

// 防止多进程同时启动
global.singleInstance = CORE.helper.single_instance;

// 处理命令行工具启动过程中的错误
require('../lib/error_handler.js');

global.LeanFork = require('../lib/avoscloud_runner');

// 处理特殊命令（这些命令没有环境）
if(action == 'init'){
	return require('../init_commands/copy_init_app_struct');
}
if(action == 'dependence'){
	return require('../init_commands/resolve_dependence');
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
process.chdir(APP_PATH); // <<-- 
if(!fs.existsSync('.avoscloud')){
	fs.mkdirSync('.avoscloud');
}
if(true && !fs.existsSync('.avoscloud/inspect.core.js')){
	fs.writeFileSync('.avoscloud/inspect.core.js', CORE.createInspect('global.CORE'), 'utf-8');
	// console.log('inspection file saved..');
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
	return require('./command_alias').save();
}

// 检查要运行的命令文件
var command_file = LEANG_PATH + 'commands/' + action + '.js';
if(!fs.existsSync(command_file)){
	return usage_cmd("未知命令: " + action + ".");
}

// 读取avos配置
global.APP_CONFIG = new (CORE.helper.ConfigLoader)(CONFIG_PATH + '/');
APP_CONFIG.load_environment('default', false);

global.APP_ENVIRONMENT = assert_process_argument(3, usage_environment, '缺少环境定义文件');
if(APP_ENVIRONMENT != 'default'){
	APP_CONFIG.load_environment(APP_ENVIRONMENT, true);
}

global.config = CORE.helper.ConfigGenerator;
global.APP_SERVER = assert_process_argument(4, usage_server, '缺少服务器定义文件');
APP_CONFIG.load_server(global.APP_SERVER, true);

singleInstance.start(real_run);

/* real run !! */
function real_run(){
	deploySettings.commit();
	
	var content = fs.readFileSync(command_file, 'utf8');
	var action = /@windowTitle: (.*)/.exec(content);
	action = action? action[1] : '不知作甚';
	
	process.stdout.write('\x1B]0;正在' + action + '：' + deploySettings.getApplicationName() + '（' +
	                     APP_CONFIG.environmentName + '@' + APP_CONFIG.serverName + '）' + '\x07');
	global.config.everything();
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
	require('fs').readdirSync(LEANG_PATH + 'commands').filter(function (n){
		return n.substr(0, 1) != '.';
	}).map(function (f){
		var content = fs.readFileSync(LEANG_PATH + 'commands/' + f);
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
	if(!fs.existsSync(CONFIG_PATH + 'environment')){
		fs.mkdirSync(CONFIG_PATH + 'environment');
	}
	console.error('可用环境:');
	fs.readdirSync(CONFIG_PATH + 'environment').filter(function (n){
		return n.substr(0, 1) != '.' && n != 'default.json';
	}).forEach(function (f){
		try{
			var envName = JSON.parse(fs.readFileSync(CONFIG_PATH + 'environment/' + f)).environmentName;
		} catch(e){
			envName = '配置文件无法解析 - ' + e.message;
		}
		console.error('\t' + colors.green(path.basename(f, '.json')) + ' - ' + envName);
	});
}

function usage_server(){
	console.error('可用服务器:');
	if(!fs.existsSync(CONFIG_PATH + '/server')){
		fs.mkdirSync(CONFIG_PATH + '/server');
	}
	fs.readdirSync(CONFIG_PATH + '/server').filter(function (n){
		return n.substr(0, 1) != '.';
	}).forEach(function (f){
		try{
			var serverName = JSON.parse(fs.readFileSync(CONFIG_PATH + '/server/' + f)).serverName;
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
