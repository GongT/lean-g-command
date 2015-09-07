#!/bin/env node
"use strict";

var parser = require('lean-g-template-nsmarty').parseFile;
var fs = require('fs'), path = require('path');

delete global.nsmarty.templatePath;
global.nsmarty.templatePath = ['./documents/'];

var data = {
	ABSURL: '/lean-g-command/doc',
	PUBURL: '/lean-g-command'
}, files;

process.chdir('documents');
if(process.argv[2]){
	var f = process.argv[2];
	if(!fs.existsSync(f)){
		console.error('\x1B[38;5;9m[ERROR]\x1B[0mfile not found: %s', f);
		process.exit(1);
	}
	files = [f];
} else{
	files = loop_dir_each('.');
}
process.chdir('..');
if(!fs.existsSync('doc')){
	fs.mkdirSync('doc');
}

var length = files.length;

files.forEach(function (f){
	var templateFile = f.replace(/^\.\//g, '');
	var resultFile = 'doc/' + templateFile.replace(/\.tpl$/, '.html');
	// data.baseUri = path.dirname(resultFile);
	console.error('\x1B[38;5;14m[INFO]\x1B[0mfile render: %s', templateFile);
	parser(templateFile, data, function (err, body){
		if(err){
			console.error('\x1B[38;5;9m[WARN]\x1B[0mfile render fail: %s', templateFile, err);
			process.exit(1);
		} else{
			var dir = path.dirname(resultFile);
			if(!fs.existsSync(dir)){
				mkdirp(dir);
			}
			fs.writeFileSync(resultFile, body, 'utf-8');
			console.error('\x1B[38;5;10m[SUCC]\x1B[0mfile render complete: %s', templateFile);
			
			finish();
		}
	});
});

function finish(){
	if(--length === 0){
		setTimeout(function (){
			// console.log('everything finished.');
		}, 100);
	}
}

function mkdirp(path){
	var pathArr = path.split('/');
	var p = '';
	
	while(pathArr.length > 0){
		p += pathArr.shift() + '/';
		if(!fs.existsSync(p)){
			fs.mkdirSync(p, 511);
		}
	}
}

function loop_dir_each(dir, ret){
	if(!ret){
		ret = [];
	}
	fs.readdirSync(dir).forEach(function (f){
		if(/^\./.test(f) || (f === 'include')){
			return;
		}
		
		var fp = dir + '/' + f;
		if(fs.lstatSync(fp).isDirectory()){
			loop_dir_each(fp, ret);
		} else if(/\.tpl$/.test(f)){
			ret.push(fp);
		}
	});
	return ret;
}
