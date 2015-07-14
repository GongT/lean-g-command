"use strict";
var fs = require('fs');
var path = require('path');

if(!fs.existsSync(APP_PATH)){
	if(!fs.mkdirSync(APP_PATH)){
		console.error('Error: cannot mkdir at ' + APP_PATH + '.');
		process.exit(1);
	}
}
if(fs.readdirSync(APP_PATH).filter(hiddens).filter(modules).length > 0){
	console.error('Error: folder is not empty, you cannot init app here.');
	process.exit(1);
}

process.chdir(APP_PATH);

touch('main.js');
touch('package.json');
touch('.gitignore');

mkdirp('.avoscloud');

mkdirp('include/config/application');
mkdirp('include/config/environment');
mkdirp('include/config/server');
touchJSON('include/config/settings.json');

touchJSON('include/ErrorMessageDefine.json');

mkdirp('include/database/User');
touch('include/database/User/User.js');
mkdirp('include/database/_proto_/static');
mkdirp('include/database/_proto_/property');

mkdirp('include/debugger');

mkdirp('include/library');

mkdirp('include/middlewares');

mkdirp('express/controllers');
mkdirp('express/public/css');
mkdirp('express/public/js');
mkdirp('express/public/scripts');
mkdirp('express/public/styles');
mkdirp('express/views');

mkdirp('cloud/functions');
mkdirp('cloud/functions-debug');

xcopy(__dirname + '/defaultConfig', 'include/config');

console.log("\n[OK] app root struct init complete.");

function hiddens(f){
	return !/^\./.test(f);
}

function modules(f){
	return f !== 'node_modules' && f !== 'local_modules' && f !== 'package.json';
}

function xcopy(source, target){
	console.log('复制文件 %s -> %s', source, target);
	if(!/\/$/.test(source)){
		source += '/';
	}
	if(LeanFork.isWindows){
		LeanFork.external_sync('xcopy', ['/E', '/I', '/H', '/Y', source, target]);
	} else{
		LeanFork.external_sync('cp', ['-r', '-v', '-f', source + '.', target]);
	}
}

function mklink(source, target){
	console.log('创建链接 %s -> %s', source, target);
	if(LeanFork.isWindows){
		LeanFork.external_sync('mklink', ['/S', target, source]);
	} else{
		LeanFork.external_sync('ln', ['-s', source, target]);
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

function touchJSON(f){
	if(!fs.existsSync(f)){
		fs.writeFileSync(f, "{\n\t\n}", "utf-8");
	}
}

function touch(f){
	if(!fs.existsSync(f)){
		fs.writeFileSync(f, "\n", "utf-8");
	}
}
