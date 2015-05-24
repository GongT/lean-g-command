var fs = require('fs');
var path = require('path');
var basename = require('path').basename;

var jsJsFile = /\.js$/;

module.exports.read_source_tree = read_source_tree;
module.exports.read_core_source_tree = function (dir){
	return read_source_tree('node_modules/lean-g/' + dir);
};

module.exports.read_source_deep_each = read_cloud_source_deep_each;
module.exports.read_source_each = read_cloud_source_flat_each;
module.exports.read_cloud_source_deep_each = function (f, callback){
	return read_cloud_source_deep_each(f, function (mdl, abs, rel){
		return callback.call(this, mdl, abs, 'cloud/' + rel);
	}, AV.CLOUD_PATH);
};
module.exports.read_cloud_source_each = function (f, callback){
	return read_cloud_source_flat_each(f, function (mdl, abs, rel){
		return callback.call(this, mdl, abs, 'cloud/' + rel);
	}, AV.CLOUD_PATH);
};
module.exports.read_core_source_deep_each = function (f, callback){
	return read_cloud_source_deep_each(f, callback, AV.LEANG_PATH);
};
module.exports.read_core_source_each = function (f, callback){
	return read_cloud_source_flat_each(f, callback, AV.LEANG_PATH);
};

module.exports.read_dir = readDirSync;
module.exports.read_core_dir = function (dir){
	return readDirSync(dir, AV.LEANG_PATH);
};
module.exports.read_dir_deep = readDirDeepSync;
module.exports.read_core_dir_deep = function (dir){
	return readDirDeepSync(dir, [], AV.LEANG_PATH);
};

function read_source_tree(dir){
	var ret = {};
	var hidden = /^\./;
	
	if(!/[\/\\]$/.test(dir)){
		dir += '/';
	}
	var APP_PATH = AV.APP_PATH;
	// console.log('APP_PATH=%s, dir=%s', APP_PATH, dir);
	
	if(!fs.existsSync(APP_PATH + dir)){
		console.log('Warn: folder NOT exists: ' + APP_PATH + dir);
		return {};
	}
	fs.readdirSync(APP_PATH + dir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(fs.lstatSync(APP_PATH + dir + f).isDirectory()){
			ret[basename(f, '.js')] = read_source_tree(dir + f + '/');
		} else if(jsJsFile.test(f)){
			ret[basename(f, '.js')] = dir + f;
		}
	});
	return ret;
}
function read_cloud_source_flat_each(ccdir, callback){
	var hidden = /^\./;
	
	if(!/[\/\\]$/.test(ccdir)){
		ccdir += '/';
	}
	var CLOUD_PATH = AV.CLOUD_PATH;
	
	if(!fs.existsSync(CLOUD_PATH + ccdir)){
		console.log('Warn: folder NOT exists: ' + CLOUD_PATH + ccdir);
		return {};
	}
	fs.readdirSync(CLOUD_PATH + ccdir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(jsJsFile.test(f)){
			callback(basename(f, '.js'), CLOUD_PATH + ccdir + f, ccdir + f);
		}
	});
}

function read_cloud_source_deep_each(ccdir, callback, ROOT){
	var hidden = /^\./;
	
	if(!/[\/\\]$/.test(ccdir)){
		ccdir += '/';
	}
	
	if(!ROOT){
		ROOT = AV.APP_PATH;
	}
	
	if(!fs.existsSync(ROOT + ccdir)){
		console.log('Warn: folder NOT exists: ' + ROOT + ccdir);
		return {};
	}
	fs.readdirSync(ROOT + ccdir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(fs.lstatSync(ROOT + ccdir + f).isDirectory()){
			read_source_tree(ccdir + f + '/', callback);
		} else if(jsJsFile.test(f)){
			callback(basename(f, '.js'), ROOT + ccdir + f, ccdir + f);
		}
	});
}

function readDirSync(dir, ROOT){
	if(!ROOT){
		ROOT = AV.APP_PATH;
	}
	var hidden = /^\./;
	if(!fs.existsSync(ROOT + dir)){
		console.log('Warn: folder NOT exists: ' + ROOT + dir);
		return [];
	}
	return fs.readdirSync(ROOT + dir).filter(function (f){
		return !hidden.test(f);
	});
}

function readDirDeepSync(dir, ret, ROOT){
	if(!ret){
		ret = [];
	}
	if(!ROOT){
		ROOT = AV.APP_PATH;
	}
	var hidden = /^\./;
	if(!fs.existsSync(ROOT + dir)){
		console.log('Warn: folder NOT exists: ' + ROOT + dir);
		return [];
	}
	fs.readdirSync(ROOT + dir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(fs.lstatSync(ROOT + dir + f).isDirectory()){
			readDirDeepSync(dir + f + '/', ret, ROOT);
		} else if(jsJsFile.test(f)){
			ret.push(f);
		}
	});
	return ret;
}
