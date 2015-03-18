global.LogPrepend = require('./log_prepend');
var reconfigure = require('./reconfigure');
var filewatcher = require('./watcher');
var ProcessController = require('./process_control');
var self = module.exports;

var console = new LogPrepend('调试服务器管理');

var fs = require('fs'),
		path = require('path'),
		Promise = require('promise');

var child;

function prepareService(){
	console.log('准备启动调试服务器');
	
	process.env.LEANG_DEBUG = 'yes';
	process.stdin.setEncoding('utf8');
	if(!APP_CONFIG.isDebugEnv){
		APP_CONFIG.isDebugEnv = true;
		reconfigure.function();
	}
}

function startService(){
	if(child && child.running){
		return shutdownService();
	}
	console.log('启动调试服务器...');
	self.emit('start');
	child = new ProcessController;
	handle(child);
	child.start(function (){
		console.success('调试服务器已启动...');
		self.emit('started');
	});
	child.on('shutdown', function (c){
		self.emit('shutdown', c);
	})
}

function shutdownService(){
	if(child.running){
		console.log('停止调试服务器...');
		self.emit('shuttingdown');
		unhandle(child);
		return child.shutdown().done(function (){
			console.success('调试服务器已停止...');
			child = null;
		})
	} else{
		self.emit('shutdown', 0);
		return Promise.resolve();
	}
}

function restartService(){
	console.log('调试重新启动...');
	self.emit('restarting');
	shutdownService().done(function (){
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
	if(child && child.running){
		child.call(params);
	} else{
		console.warn('调用remoteCall时子线程已经结束');
	}
};

var EventEmitter = require('events').EventEmitter;
require('util')._extend(self, EventEmitter.prototype)
EventEmitter.call(self);


