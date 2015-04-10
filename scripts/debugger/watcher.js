var console = new LogPrepend('文件监视器');
var path = require('path');
var watch, imm;
var reconfigure = require('./reconfigure');

var EventEmitter = require('events').EventEmitter;
var self = module.exports = new EventEmitter;

self.start = function (){
	if(watch){
		console.warn('重复start');
		return;
	}
	watch = require('chokidar').watch(require('fs').realpathSync('./'), {
		ignored      : /\.git|\.idea|\.avoscloud|README|___jb_bak___|__gen|public\/|views\//,
		ignoreInitial: true
	});
	imm = setImmediate(function (){
		imm = 0;
		watch.on('add', on_struct_change).on('change', on_file_change).on('unlink', on_struct_change)
	});
};

self.stop = function (){
	if(!watch){
		console.trace('重复stop');
		return;
	}
	
	watch.removeAllListeners();
	watch.close();
	watch = false;
	if(imm){
		clearImmediate(imm);
	}
};

function on_file_change(file){
	file = path.resolve(file);
	file = file.replace(/\\/g, '/');
	file = file.replace(/^.*\/lean-g\//, 'G/');
	file = file.replace(global.APPPATH + 'cloud/', 'C/');
	file = file.replace(global.APPPATH, 'R/');
	
	if(/(^C\/timers|\/trigger)\//.test(file)){
		console.info('触发器和定时器需要部署才能生效！');
		return;
	} else if(/^C\/(config)\//.test(file)){
		if(/global.json/.test(file)){
			console.warn('config/global.json 不应该被修改');
			return;
		}
		console.info('更新配置');
		reconfigure.config = true;
	} else if(/^R\/errormessage.json/.test(file)){
		console.info('更新错误码');
		reconfigure.errno = true;
	} else if(/^G\/scripts\/|^\/G\/(lean-g)\/leancloud.js/.test(file)){
		console.info('核心模块有改动，当前进程可能需要重启才能生效。');
		return;
	} else if(/package\.json/.test(file)){
		console.warn('package.json 不应该被修改');
		return;
	} else if(/\.js/.test(file)){
		console.debug('file change ', file);
	} else if(/\/views\//.test(file)){
		console.debug('views change ', file);
	} else{
		console.debug('外部文件修改，忽略之', file);
		return;
	}
	self.emit('change', file);
}

function on_struct_change(file){
	file = path.resolve(file);
	file = file.replace(/\\/g, '/');
	file = file.replace(/^.*\/lean-g\//, 'G/');
	file = file.replace(global.APPPATH + 'cloud/', 'C/');
	file = file.replace(global.APPPATH, 'R/');
	
	if(/^C\/database\//.test(file)){
		console.info('更新数据库定义');
		reconfigure.module = true;
	} else if(/^C\/functions(\-debug)?\//.test(file)){
		console.info('更新云代码');
		reconfigure.function = true;
	} else if(/^C\/library\//.test(file)){
		console.info('更新library');
		reconfigure.library = true;
	} else if(/^C\/controllers\//.test(file)){
		console.info('更新express');
		reconfigure.express = true;
	} else if(/package\.json/.test(file)){
		console.warn('package.json 不应该被修改');
		return;
	} else if(/\.js/.test(file)){
		console.debug('file struct change ', file);
	} else if(/\/views\//.test(file)){
		console.debug('views struct change ', file);
	} else{
		console.debug('外部文件添加删除，忽略之', file);
		return;
	}
	self.emit('change', file);
}
