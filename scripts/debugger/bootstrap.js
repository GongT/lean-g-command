global.LogPrepend = require('./log_prepend');
var reconfigure = require('./reconfigure');
var filewatcher = require('./watcher');
var ProcessController = require('./process_control');
var EventEmitter = require('events').EventEmitter;
var self = module.exports = new EventEmitter;

var console = new LogPrepend('调试服务器宿主');

var fs = require('fs'),
		path = require('path'),
		Promise = require('promise');

var child;

function prepareService(){
	console.log('准备启动调试服务器');
	
	process.env.LEANG_DEBUG = 'yes';
	process.stdin.setEncoding('utf8');
	if(!APP_CONFIG.isDebugEnv){
		console.log('开启调试云代码函数');
		APP_CONFIG.isDebugEnv = true;
		reconfigure.function();
	}
}

function startService(){
	if(child && child.isRunning()){
		return shutdownService();
	}
	console.log('启动调试服务器...');
	self.emit('start');
	child = new ProcessController;
	handle(child);
	reconfigure.config();
	child.start(function (){
		console.success('调试服务器已启动...');
		self.emit('started');
	});
	child.on('shutdown', function (c){
		if(!restarting){ // finally end process
			self.emit('shutdown', c);
		}
	});
}

function shutdownService(cb){
	console.log('停止调试服务器...');
	self.emit('shuttingdown');
	if(child.isRunning()){
		unhandle(child);
		child.shutdown(function (){
			console.success('调试服务器已停止...');
			child = null;
			if(cb){
				cb();
			}
		});
	} else{
		console.warn('调试服务器并未启动...');
		if(cb){
			cb();
		}
	}
}

var restarting;
function restartService(){
	console.log('调试重新启动...');
	restarting = true;
	self.emit('restarting');
	shutdownService(function (){
		restarting = false;
		console.log('start...');
		startService();
	});
}
function terminateService(){
	console.warn('强制结束调试...');
	unhandle(child);
	child.kill();
	self.emit('terminate');
}

function unhandle(child){
	
}
function handle(child){
	child.on('init', function (){
		console.info('child init ok');
	});
	child.on('fail', function (why){
		console.info('child fail becouse %s: ', why);
	});
}

self.startService = startService;
self.shutdownService = shutdownService;
self.restartService = restartService;
self.terminateService = terminateService;
self.prepareService = prepareService;

self.remoteCall = function (params){
	if(child && child.isRunning()){
		child.call(params);
	} else{
		console.warn('调用remoteCall时子线程已经结束');
	}
};

filewatcher.on('change', function (file){
	console.info('调试程序重启，因为检测到文件修改：', file);
	setTimeout(restartService, 500);
});
self.on('started', function (){
	filewatcher.start();
});
self.on('shuttingdown', function (){
	filewatcher.stop();
});
