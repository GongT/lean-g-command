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
	self.paused = true;
	watch = require('chokidar').watch(require('fs').realpathSync('./'), {
		ignored      : /\.git|\.idea|\.avoscloud|README\.md|___jb_bak___|__gen|public\/|\/config\/global\.json/,
		ignoreInitial: true
	});
	imm = setImmediate(function (){
		imm = 0;
		watch
				.on('change', on_file_change)
				.on('unlink', on_struct_change)
				.on('add', on_struct_change)
	});
};
self.pause = function (){
	if(!self.paused){
		console.info('paused');
	}
	self.paused = true;
};
self.resume = function (){
	if(self.paused){
		console.info('resumed');
	}
	self.paused = false;
};

self.stop = function (){
	if(!watch){
		console.trace('重复stop');
		return;
	}
	
	console.trace('stop');
	watch.removeAllListeners();
	watch.close();
	watch = false;
	if(imm){
		clearImmediate(imm);
	}
};

function on_file_change(file){
	if(self.paused){
		return;
	}
	file = path.resolve(file);
	file = file.replace(/\\/g, '/');
	file = file.replace(/^.*\/lean-g\//, 'G/');
	file = file.replace(global.APPPATH + 'cloud/', 'C/');
	file = file.replace(global.APPPATH, 'R/');
	
	if(/(^C\/timers|\/trigger)\//.test(file)){
		console.info('触发器和定时器需要部署才能生效！');
		return;
	} else if(/^R\/(config)\//.test(file)){
		if(/global.json/.test(file)){
			console.warn('config/global.json 不应该被修改');
			return;
		}
		console.info('更新配置');
		reconfigure('config');
	} else if(/^R\/errormessage.json/.test(file)){
		console.info('更新错误码');
		reconfigure('errno');
	} else if(/^G\/scripts\/|^\/G\/(lean-g)\/leancloud.js/.test(file)){
		console.info('核心模块有改动，当前进程可能需要重启才能生效。');
		return;
	} else if(/package\.json/.test(file)){
		console.warn('package.json 不应该被修改');
		return;
	} else if(/\.js/.test(file)){
		console.debug('file change ', file);
	} else if(/\/views\//.test(file)){
		if(!/\.ejs$/.test(file)){
			self.emit('small-change', file);
			return;
		}
		console.debug('views change ', file);
	} else{
		console.debug('外部文件修改，忽略之', file);
		return;
	}
	deplay_emit(file);
}

function on_struct_change(file){
	if(self.paused){
		return;
	}
	file = path.resolve(file);
	file = file.replace(/\\/g, '/');
	file = file.replace(/^.*\/lean-g\//, 'G/');
	file = file.replace(global.APPPATH + 'cloud/', 'C/');
	file = file.replace(global.APPPATH, 'R/');
	
	if(/^C\/database\//.test(file)){
		console.info('更新数据库定义');
		reconfigure('module');
	} else if(/^C\/functions(\-debug)?\//.test(file)){
		console.info('更新云代码');
		reconfigure('function');
	} else if(/^C\/library\//.test(file)){
		console.info('更新library');
		reconfigure('library');
	} else if(/^C\/controllers\//.test(file)){
		console.info('更新express');
		reconfigure('express');
	} else if(/package\.json/.test(file)){
		console.warn('package.json 不应该被修改');
		return;
	} else if(/\.js/.test(file)){
		console.debug('file struct change ', file);
	} else if(/\/views\//.test(file)){
		if(!/\.ejs$/.test(file)){
			self.emit('small-change', file);
			return;
		}
		console.debug('views struct change ', file);
	} else{
		console.debug('外部文件添加删除，忽略之', file);
		return;
	}
	deplay_emit(file);
}

var changeTimer, deplayedFiles = [], delayTimeout;
function deplay_emit(file){
	if(deplayedFiles.indexOf(file) == -1){
		deplayedFiles.push(file);
	}
	delayTimeout = 5;
	if(changeTimer){
		return;
	}
	changeTimer = setInterval(function (){
		delayTimeout--;
		if(delayTimeout == 0){
			console.log('\r\x1B[K');
			clearInterval(changeTimer);
			changeTimer = false;
			self.emit('change', '\n\t' + deplayedFiles.join('\n\t'));
		} else{
			process.stdout.write('\r ' + delayTimeout + ' 秒后重启\x1B[K\r');
		}
	}, 1000);
}
