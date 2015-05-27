var fs = require('fs');
var path = require('path');
var basename = require('path').basename;

var debug = function (msg){
	if(AV.loaded){
		console.error(msg);
	} else{
		global.appLoaderLog += msg + '\n';
	}
};

var jsJsFile = /\.js$/;

module.exports.read_source_tree = function (dir){
	return read_source_tree(AV.APP_PATH + dir);
};
module.exports.read_cloud_source_tree = read_cloud_source_tree;
module.exports.read_core_source_tree = function (dir){
	return read_source_tree(AV.LEANG_PATH + dir);
};

module.exports.read_source_tree_foreach = function (f, callback){
	return read_source_deep_each(AV.APP_PATH + f, callback);
};
module.exports.read_source_foreach = function (f, callback){
	return read_source_flat_each(AV.APP_PATH + f, callback);
};
module.exports.read_cloud_source_tree_foreach = function (f, callback){
	return read_source_deep_each(AV.CLOUD_PATH, callback, f, 'cloud');
};
module.exports.read_cloud_source_foreach = function (f, callback){
	return read_source_flat_each(AV.CLOUD_PATH, callback, f, 'cloud');
};
module.exports.read_core_source_tree_foreach = function (f, callback){
	return read_source_deep_each(AV.LEANG_PATH + f, callback);
};
module.exports.read_core_source_foreach = function (f, callback){
	return read_source_flat_each(AV.LEANG_PATH + f, callback);
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
	if(!fs.existsSync(dir)){
		debug('Warn: folder NOT exists: ' + dir);
		return {};
	}
	fs.readdirSync(dir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(fs.lstatSync(dir + f).isDirectory()){
			ret[basename(f, '.js')] = read_source_tree(dir + f + '/');
		} else if(jsJsFile.test(f)){
			ret[basename(f, '.js')] = dir + f;
		}
	});
	return ret;
}
function read_cloud_source_tree(dir){
	var ret = {};
	var hidden = /^\./;
	
	if(!/[\/\\]$/.test(dir)){
		dir += '/';
	}
	var path = AV.CLOUD_PATH + dir;
	if(!fs.existsSync(path)){
		debug('Warn: folder NOT exists: ' + path);
		return {};
	}
	fs.readdirSync(path).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(fs.lstatSync(path + f).isDirectory()){
			ret[basename(f, '.js')] = read_source_tree(dir + f + '/');
		} else if(jsJsFile.test(f)){
			ret[basename(f, '.js')] = 'cloud/' + dir + f;
		}
	});
	return ret;
}
function read_source_flat_each(ccdir, callback, relRoot, relInput){
	var hidden = /^\./;
	
	if(!/[\/\\]$/.test(ccdir)){
		ccdir += '/';
	}
	if(!relRoot){
		relRoot = '';
	} else if(!/[\/\\]$/.test(relRoot)){
		relRoot += '/';
	}
	ccdir += relRoot;
	
	if(!fs.existsSync(ccdir)){
		debug('Warn: folder NOT exists: ' + ccdir);
		return {};
	}
	fs.readdirSync(ccdir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(jsJsFile.test(f)){
			callback(basename(f, '.js'), ccdir + f, relRoot + f, relInput + relRoot + f);
		}
	});
}

function read_source_deep_each(ccdir, callback, relRoot, relInput){
	var hidden = /^\./;
	
	if(!/[\/\\]$/.test(ccdir)){
		ccdir += '/';
	}
	if(!relRoot){
		relRoot = '';
	} else if(!/[\/\\]$/.test(relRoot)){
		relRoot += '/';
	}
	
	var path = ccdir + relRoot;
	
	if(!relInput){
		relInput = path;
	} else if(!/[\/\\]$/.test(relInput)){
		relInput += '/';
	}
	
	if(!fs.existsSync(path)){
		return {};
	}
	fs.readdirSync(path).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(fs.lstatSync(path + f).isDirectory()){
			read_source_deep_each(ccdir, callback, relRoot + f + '/', relInput + relRoot + f + '/');
		} else if(jsJsFile.test(f)){
			callback(basename(f, '.js'), path + f, relRoot + f, relInput + relRoot + f);
		}
	});
}

function readDirSync(dir, ROOT){
	if(!ROOT){
		ROOT = AV.APP_PATH;
	}
	var hidden = /^\./;
	if(!fs.existsSync(ROOT + dir)){
		debug('Warn: folder NOT exists: ' + ROOT + dir);
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
		debug('Warn: folder NOT exists: ' + ROOT + dir);
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
