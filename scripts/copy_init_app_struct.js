var fs = require('fs');
var path = require('path');

var APP_PATH = path.resolve(process.argv[3] || '.');
if(fs.existsSync(APP_PATH) && fs.readdirSync(APP_PATH).length > 0){
	console.error('Error: folder is not empty, you cannot init app here.');
	process.exit(1);
}

var source = path.resolve(ROOT + '/init_app_struct');
xcopy(source, APP_PATH);

var npath = path.dirname(process.argv[0]);
var child = require('child_process').spawn(npath != '.'? npath + '/npm' : 'npm', ['install'], {
	cwd  : APP_PATH,
	stdio: 'inherit'
});
child.on('exit', function (code){
	console.log('\n');
	if(code != 0){
		console.error('cannot install all dependencies, you may need run `npm install` to finish this progress.');
	}
	console.log('create app complete!');
	console.log('  you can use `' + process.argv[1] + '` config [config file name]');
	process.exit(code);
});

function mkdir_r(path){
	try{
		fs.mkdirSync(path, 511);
		return true;
	} catch(e){
		if(e.code == 'ENOENT'){
			return mkdir_r(path.resolve(path + '/..'));
		}
		return false;
	}
}

function xcopy(src, dist){
	if(fs.statSync(src).isDirectory()){
		// console.log('folder %s -> %s', src, dist);
		if(!fs.existsSync(dist)){
			if(!mkdir_r(dist)){
				console.error('Error: cannot create folder ' + APP_PATH + '.');
				process.exit(1);
			}
		}
		fs.readdirSync(src).forEach(function (file){
			xcopy(src + '/' + file, dist + '/' + file);
		});
	} else{
		// console.log('\tfile %s -> %s', src, dist);
		fs.createReadStream(src).pipe(fs.createWriteStream(dist));
	}
}
