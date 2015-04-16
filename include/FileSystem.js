var fs = require('fs');
var path = require('path');
var basename = require('path').basename;

var jsJsFile = /\.js$/;

module.exports.read_source_tree = read_source_tree;
function read_source_tree(dir){
	var ret = {};
	var hidden = /^\./;
	
	if(!/[\/\\]$/.test(dir)){
		dir += '/';
	}
	var APPPATH = AV.APPPATH;
	var APPABSPATH = AV.ABS_ROOT + AV.APPPATH;
	// console.log('APPPATH=%s, APPABSPATH=%s, dir=%s', APPPATH, APPABSPATH, dir);
	
	if(!fs.existsSync(APPABSPATH + dir)){
		console.log('Warn: folder NOT exists: ' + APPABSPATH + dir);
		return {};
	}
	fs.readdirSync(APPABSPATH + dir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(!fs.existsSync(APPABSPATH + dir + f) || fs.lstatSync(APPABSPATH + dir + f).isDirectory()){
			ret[basename(f, '.js')] = read_source_tree(dir + f + '/');
		} else if(jsJsFile.test(f)){
			ret[basename(f, '.js')] = dir + f;
		}
	});
	return ret;
}
