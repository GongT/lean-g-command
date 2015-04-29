var childProcess = require('child_process');
var Promise = require('promise');
module.exports = function (){
	var args = Array.prototype.slice.call(arguments);
	return new Promise(function (resolve, reject){
		var p = module.exports.spawn(args,
				{
					stdio: 'inherit',
					env  : process.env
				});
		p.on("exit", function (code){
			if(code == 0){
				resolve();
			} else{
				console.log("sub command failed with code " + code);
				reject();
			}
		});
	});
};

var platformExternalSpawn;
module.exports.external = function (cmd, args){
	return new Promise(function (resolve, reject){
		console.log('start external program - %s', cmd);
		var params = {
			stdio: 'inherit',
			env  : process.env
		};
		if(arguments[2]){
			require('util')._extend(params, arguments[2])
		}
		var p = platformExternalSpawn(cmd, args, params);
		p.on("exit", function (code){
			if(code == 0){
				resolve();
			} else{
				console.log("sub command failed with code " + code);
				reject(code);
			}
		});
	});
};

module.exports.external_stdout = function (cmd, args){
	return new Promise(function (resolve, reject){
		console.log('start external program - %s', cmd);
		var p = platformExternalSpawn(cmd, args);
		var stdout = '', stderr = '';
		p.stdout.on('data', function (data){
			stdout += data.toString();
		});
		
		p.stderr.on('data', function (data){
			stderr += data.toString();
		});
		p.on("exit", function (code){
			if(code == 0){
				resolve(stdout, stderr);
			} else{
				console.log("sub command failed with code " + code);
				reject(stdout, stderr);
			}
		});
	});
};

module.exports.runner = require('path').resolve(APPPATH, 'node_modules/avoscloud-code/bin/run.js');
if(!module.exports.runner){
	console.error("Cannot find avoscloud-code.");
	process.exit(-1);
}

if(process.env.comspec){
	module.exports.spawn = spawn_windows;
	platformExternalSpawn = exec_windows;
	process.isWindows = module.exports.isWindows = true;
} else{
	module.exports.spawn = spawn_linux;
	platformExternalSpawn = exec_linux;
	process.isWindows = module.exports.isWindows = false;
}

function spawn_windows(args, options){
	if(!args){
		args = [];
	}
	args = ['/C', 'node', module.exports.runner].concat(args);
	
	console.log('call lean-cloud script - %s %s.', process.env.comspec, args.join(' '));
	return childProcess.spawn(process.env.comspec, args, options);
}

function spawn_linux(args, options){
	console.log('call lean-cloud script - %s %s.', module.exports.runner, args.join(' '));
	return childProcess.spawn(module.exports.runner, args, options);
}

function exec_windows(command, args, options){
	if(!args){
		args = [];
	}
	args = ['/C', command].concat(args);
	
	console.log('exec external file - %s %s.', process.env.comspec, args.join(' '));
	return childProcess.spawn(process.env.comspec, args, options);
}

function exec_linux(command, args, options){
	console.log('exec external file - %s %s.', command, args.join(' '));
	return childProcess.spawn(command, args, options);
}
