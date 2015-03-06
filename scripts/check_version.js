var fs = require('fs');
var isWin = /^win/.test(process.platform);
var SAVE_PATH = process.cwd() + '/.avoscloud/node/';
var SAVE_FILE = SAVE_PATH + 'node' + (isWin? '.exe' : '.tar.gz');
var PATH_TO_NODE = isWin? SAVE_FILE : SAVE_PATH + 'bin/node';

module.exports = (function (){
	var get_sub = /v\d+\.(\d+)\.\d+/;
	console.error('nodejs version = '+process.version);
	
	var maths = get_sub.exec(process.version);
	if(!maths){
		console.error('WARN: 无法确认nodejs版本，请自行确定版本号高于 v0.12.0');
		return true;
	}
	var current = parseInt(maths[1]);
	if(current < 12){
		if(fs.existsSync(PATH_TO_NODE)){
			return restart();
		}
		console.error('nodejs版本太老: ' + process.version + '，需要: v0.12.0 以上');
		determine();
		return false;
	}
	return true;
})();

function not_complete(){
	process.on('exit', delete_part_file);
	process.on('SIGINT', delete_part_file);
	process.on('uncaughtException', delete_part_file);
}
function complete(){
	process.removeListener('exit', delete_part_file);
	process.removeListener('SIGINT', delete_part_file);
	process.removeListener('uncaughtException', delete_part_file);
}

function delete_part_file(error){
	if(error){
		console.error(error.stack? error.stack : error);
	}
	if(fs.existsSync(SAVE_FILE)){
		fs.unlinkSync(SAVE_FILE);
	}
	process.removeAllListeners('exit');
	process.exit(2);
}

function determine(){
	var url = '';
	if(isWin){
		if(process.arch === 'x64'){
			url = 'http://nodejs.org/dist/latest/x64/node.exe';
		} else{
			url = 'http://nodejs.org/dist/latest/node.exe';
		}
		download(url);
	} else{
		animation();
		require("http").get('http://nodejs.org/dist/latest/', function (res){
			stopAnimation();
			if(res.statusCode != 200){
				console.log(res)
				error("nodejs服务器错误 - " + res.statusCode);
			}
			var body = '';
			res.on('data', function (chunk){
				body += chunk;
			});
			res.on('end', function (){
				var find = /node\-(v\d+\.\d+\.\d+)/g;
				var maths = find.exec(body);
				if(!maths){
					error("版本号判断失败");
				}
				url = 'http://nodejs.org/dist/latest/node-' + maths[1] + '-' + process.platform + '-' + getArch() +
				      '.tar.gz';
				download(url);
			});
		}).on('error', function (e){
			error('网络错误');
		});
	}
}

function download(url){
	if(!fs.existsSync(SAVE_PATH)){
		fs.mkdirSync(SAVE_PATH);
	}
	if(fs.existsSync(SAVE_FILE)){
		untar();
	} else{
		var file = fs.createWriteStream(SAVE_FILE);
		not_complete();
		console.log('正在从 %s 下载');
		var req = require("http").get(url, function (res){
			if(res.statusCode != 200){
				error("nodejs下载服务器错误");
			}
			show_progress(req, res);
			if(isWin){
				res.pipe(file);
				file.on('finish', function (){
					file.close(success);
					complete();
				});
			} else{
				var gunzip = require('zlib').createGunzip();
				res.pipe(gunzip);
				gunzip.pipe(file);
				file.on('finish', function (){
					file.close(untar);
				});
				file.on('finish', complete);
			}
		}).on('error', function (e){
			error('下载错误');
		});
	}
}

function untar(){
	try{
		var tar = require('tar');
	} catch(e){
		return install_tar();
	}
	var extractor = tar.Extract({
		path : SAVE_PATH,
		strip: 1
	})
			.on('error', function (){
				error('解压缩 - ' + e.message);
			})
			.on('end', success);
	
	fs.createReadStream(SAVE_FILE)
			.on('error', function (e){
				error('文件读取失败 - ' + e.message);
			})
			.pipe(extractor);
}

function install_tar(){
	stopAnimation();
	animation();
	
	require('./pure_install.js')(function (e){
		stopAnimation();
		if(e === 0){
			console.log('tar installed...');
			untar();
		} else{
			error('缺少npm依赖：tar');
		}
	}, "tar");
}

function error(msg){
	stopAnimation();
	console.error((msg? msg + '，' : '') + '无法找到最新版本Nodejs，请手动更新 http://nodejs.org/download/');
	process.exit(1);
}

function success(){
	stopAnimation();
	console.log('node更新成功...');
	restart();
}

function restart(){
	if(fs.existsSync('.runlock')){
		fs.unlinkSync('.runlock');
	}
	var args = process.argv.slice(1);
	var p = require('child_process').spawn(PATH_TO_NODE, args, {
		stdio: "inherit"
	});
	p.on('exit', function (e){
		process.exit(e);
	})
}
function getArch(){
	switch(process.arch){
	case "x64":
		return 'x64';
	case "ia32":
		return 'x32';
	case "arm":
		return 'x32';
	default:
		error('未知架构');
	}
}

var tmr;
function animation(){
	if(!process.stdin.isTTY){
		return;
	}
	var i = 0;
	var arr = ['|', '/', '-', '\\', '|', '/', '-', '\\'];
	tmr = setInterval(function (){
		process.stderr.write(arr[i] + '\r');
		i++;
		if(i == arr.length){
			i = 0;
		}
	}, 100);
}

function stopAnimation(){
	if(tmr){
		clearInterval(tmr);
		tmr = 0;
	}
}
function show_progress(req, res){
	stopAnimation();
	var progress = [];
	progress.last = -1;
	for(var i = 0; i < 40; i++){
		progress.push('-');
	}
	var length = res.headers['content-length'], chuncked = 0;
	res.on('data', function (chunk){
		chuncked += chunk.length;
		if(!length){
			process.stderr.write('   ' + chuncked + '/???\r');
			return;
		}
		var percent = chuncked/length;
		var curitr = Math.floor(percent*40);
		if(curitr >= 40){
			curitr = 39;
		}
		progress[curitr + 1] = '>';
		for(var i = curitr; i > progress.last; i--){
			progress[i] = '=';
		}
		progress.last = curitr;
		
		process.stderr.write(' [' + progress.join('') + ']   ' +
		                     Math.floor(percent*100) + '%\r');
	});
}
