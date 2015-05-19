var fs = require('fs');
var path = require('path');
var avosrun = require('../avrun');

var APP_PATH = path.resolve(process.argv[3] || '.') + '/';
if(fs.existsSync(APP_PATH) && fs.readdirSync(APP_PATH).filter(hiddens).length > 0){
	console.error('Error: folder is not empty, you cannot init app here.');
	process.exit(1);
}
if(!fs.existsSync(APP_PATH)){
	if(!fs.mkdirSync(APP_PATH)){
		console.error('Error: cannot mkdir at ' + APP_PATH + '.');
		process.exit(1);
	}
}
if(!fs.existsSync(APP_PATH + 'node_modules')){
	fs.mkdirSync(APP_PATH + 'node_modules');
}
process.chdir(APP_PATH);
var initGit = false;
if(!fs.existsSync(APP_PATH + '.git')){
	avosrun.external_sync('git', ['init', '.']);
	initGit = true;
}

process.stdin.resume();
var source = path.resolve(CGROOT + '/init_app_struct') + '/';

console.log('复制文件 %s -> %s', source, APP_PATH);
if(avosrun.isWindows){
	avosrun.external_sync('xcopy', ['/E', '/I', '/H', '/Y', source, '.']);
	avosrun.external_sync('mklink', ['/J', APP_PATH + '/cloud/lean-g', CGROOT]);
} else{
	avosrun.external_sync('cp', ['-r', '-v', '-f', source + '.', '.']);
	avosrun.external_sync('ln', ['-s', CGROOT, APP_PATH + '/cloud/lean-g']);
}

avosrun.external_sync('git', ['add', '.']);
if(initGit){
	avosrun.external_sync('git', ['commit', '-m', 'initial commit']);
}

function hiddens(f){
	return !/^\./.test(f);
}

setTimeout(function (){
	process.stdin.pause();
	console.log('');
	console.log('create app complete!');
	console.log('  you can use `' + process.argv[1] + ' config` to create app config.');
}, 0);
