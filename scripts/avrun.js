var childProcess = require('child_process');
var fs = require('fs');
var Promise = require('promise');
var isWindows = /^win/.test(process.platform);

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
				reject(code);
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

var platformExternalSpawnSync;
module.exports.external_sync = function (command, args){
	return platformExternalSpawnSync(command, args);
};

module.exports.external_stdout_eachline = function (args, cb){
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
				reject(code);
			}
		});
		var cache = {stdout: '', stderr: ''};
		p.stdout.on('data', function (data){
			cache.stdout += data.toString();
			call_cb('stdout', true);
		});
		
		p.stderr.on('data', function (data){
			cache.stderr += data.toString();
			call_cb('stderr', false);
		});
		
		function call_cb(name, isout){
			var lines = cache[name].split('\n');
			if(lines[lines.length - 1]){
				cache[name] = lines.pop();
			} else{
				cache[name] = '';
			}
			lines.forEach(function (line){
				cb(line, isout);
			});
		}
	});
};

module.exports.runner = require('path').resolve(CGROOT, 'node_modules/avoscloud-code/bin/run.js');
if(!module.exports.runner){
	console.error("Cannot find avoscloud-code.");
	process.exit(-1);
}

if(isWindows){
	module.exports.spawn = spawn_windows;
	platformExternalSpawn = exec_windows;
	platformExternalSpawnSync = exec_windows_sync;
	process.isWindows = module.exports.isWindows = true;
} else{
	module.exports.spawn = spawn_linux;
	platformExternalSpawn = exec_linux;
	platformExternalSpawnSync = exec_linux_sync;
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

function exec_windows_sync(command, args){
	if(!args){
		args = [];
	}
	args = ['/C', command].concat(args);
	
	console.log('exec external file sync - %s %s.', process.env.comspec, args.join(' '));
	return childProcess.spawn(process.env.comspec, args, {
		stdio: "inherit"
	}).status;
}

function spawn_linux(args, options){
	console.log('call lean-cloud script - %s %s.', module.exports.runner, args.join(' '));
	return childProcess.spawn(module.exports.runner, args, options);
}

function exec_linux_sync(command, args){
	console.log('exec external file sync - %s %s.', command, args.join(' '));
	return childProcess.spawnSync(command, args, {
		stdio: "inherit"
	}).status;
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
