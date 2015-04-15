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
	
	if(!fs.existsSync(APPPATH + dir)){
		return {};
	}
	fs.readdirSync(APPPATH + dir).forEach(function (f){
		if(hidden.test(f)){
			return;
		}
		if(!fs.existsSync(dir + f) || fs.lstatSync(dir + f).isDirectory()){
			ret[basename(f, '.js')] = read_source_tree(dir + f + '/');
		} else if(jsJsFile.test(f)){
			ret[basename(f, '.js')] = dir + f;
		}
	});
	return ret;
}
