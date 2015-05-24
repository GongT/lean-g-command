var singleInstance = module.exports = {};
var fs = require('fs');
var avrun = require('../avrun');
var Promise = require('promise');

var lockFile = global.APP_PATH + '/.avoscloud/runlock';

if(!fs.existsSync(global.APP_PATH + '/.avoscloud')){
	fs.mkdirSync(global.APP_PATH + '/.avoscloud', 0777);
}

var started = false;
function checkInstance(){
	return new Promise(function (resolve, reject){
		var pid = 0;
		if(fs.existsSync(lockFile)){
			pid = parseInt(fs.readFileSync(lockFile));
		} else{
			return resolve();
		}
		
		if(process.env.comspec){
			avrun.external_stdout('tasklist', [
				'/FO',
				'table',
				'/FI',
				'PID eq ' + pid,
				'/FI',
				'IMAGENAME eq ' + require('path').basename(process.argv[0])
			]).then(function (stdout, stderr){
				if(/node.exe/.test(stdout)){
					reject();
				} else{
					resolve();
				}
			}, function (stdout, stderr){
				reject();
			});
		} else{
			var cmdfile = '/proc/' + pid + '/exe';
			if(fs.existsSync(cmdfile)){
				var cmd = fs.readlinkSync(cmdfile);
				if(/\bnode\b/.test(cmd)){
					reject();
				} else{
					resolve();
				}
			} else{
				resolve();
			}
		}
	});
}
//  /FO table /FI "PID eq 5948" /FI "IMAGENAME eq node.exe"
singleInstance.start = function (cb){
	checkInstance().then(function (){
		fs.writeFile(lockFile, process.pid.toFixed(0), function (err){
			if(err){
				console.error(err);
				return;
			}
			started = true;
			cb();
		});
	}, function (){
		started = false;
		console.error('已经启动另一个实例，为了防止出现问题，请先关闭它。');
	});
};

singleInstance.stop = function (){
	if(started){
		fs.existsSync(lockFile) && fs.unlinkSync(lockFile);
	}
};


