var fs = require('fs');
var path = require('path');
var avosrun = require('./avrun');

var xcopy_pending = [];
var xcopy_count = 0;
var states = {
	copy: false,
	main: false,
	npm : false
};

var APP_PATH = path.resolve(process.argv[3] || '.');
if(fs.existsSync(APP_PATH) && fs.readdirSync(APP_PATH).filter(hiddens).length > 0){
	console.error('Error: folder is not empty, you cannot init app here.');
	process.exit(1);
}

process.stdin.resume();
var source = path.resolve(CGROOT + '/init_app_struct');
console.log('复制文件 %s -> %s', source, APP_PATH);
xcopy(source, APP_PATH);
console.log('复制文件 %s -> %s', CGROOT + '/node_modules', APP_PATH + '/node_modules');
xcopy(CGROOT + '/node_modules', APP_PATH + '/node_modules');

if(avosrun.isWindows){
	avosrun.external('mklink', ['-s', APP_PATH + '/cloud/lean-g', CGROOT]);
} else{
	avosrun.external('ln', ['-s', CGROOT, APP_PATH + '/cloud/lean-g']);
}

states.npm = true;
/*
 var npath = path.dirname(process.argv[0]);
 avosrun.external(npath != '.'? npath + '/npm' : 'npm', ['install'], {
 cwd  : APP_PATH,
 stdio: 'inherit'
 }).then(function (code){
 states.npm = true;
 on_finish();
 }, function (code){
 states.npm = code;
 on_finish();
 });
 */

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
	if(fs.statSync(src).isSymbolicLink()){
		copy(src, dist);
	} else if(fs.statSync(src).isDirectory()){
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
		copy(src, dist);
	}
}
function copy(src, dist){
	if(xcopy_count > 5){
		process.stdout.write('' + xcopy_count + '/' + xcopy_pending.length + '  ->  ' +
		                     dist.substr(0, process.stdout.columns/2) + '\x1B[K\r');
		xcopy_pending.push([src, dist]);
		return;
	}
	xcopy_count++;
	// console.log('\tfile %s -> %s', src, dist);
	var fp = fs.createReadStream(src);
	var tp = fs.createWriteStream(dist);
	fp.on('end', function (){
		xcopy_count--;
		if(xcopy_pending.length){
			var x = xcopy_pending.shift();
			copy(x[0], x[1]);
		} else if(!xcopy_count){
			states.copy = true;
			on_finish();
		}
		process.stdout.write('' + xcopy_count + '/' + xcopy_pending.length + '  ->  ' +
		                     dist.substr(0, process.stdout.columns/2) + '\x1B[K\r');
	});
	fp.pipe(tp);
}

function hiddens(f){
	return !/^\./.test(f);
}

function on_finish(){
	for(var i in states){
		if(!states[i]){
			return;
		}
	}
	if(states.npm !== true){
		console.log('\n');
		if(code != 0){
			console.error('cannot install all dependencies, you may need run `npm install` to finish this progress.');
		}
	}
	setTimeout(function (){
		process.stdin.pause();
		console.log('');
		console.log('create app complete!');
		console.log('  you can use `' + process.argv[1] + ' config` to create app config.');
	}, 0);
}

states.main = true;
on_finish();
