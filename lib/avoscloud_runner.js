var childProcess = require('child_process');
var fs = require('fs'), path = require('path');
var Promise = require('promise');
var isWindows = /^win/.test(process.platform);
var extend = require('util')._extend;

module.exports.promise = function (){
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

try{
	var runner = require.resolve("avoscloud-code");
	runner = path.dirname(path.dirname(runner)) + '/bin/avoscloud';
	module.exports.runner = runner;
} catch(e){
	console.error('install avoscloud-code first');
	process.exit();
}
console.log('LEAN-G: avoscloud command path = %s', module.exports.runner);

if(!module.exports.runner){
	console.error("Can't find module `avoscloud-code`.");
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
	return childProcess.spawnSync(process.env.comspec, args, {
		stdio: "inherit"
	}).status;
}

module.exports.spawn_server = function (){
	var options = {
		stdio: [process.stdin, 'pipe', 'pipe'],
		env  : extend({
			LC_APP_ID        : APP_CONFIG.applicationId,
			LC_APP_KEY       : APP_CONFIG.applicationKey,
			LC_APP_MASTER_KEY: APP_CONFIG.masterKey,
			LC_APP_PORT      : deploySettings.getDebugPort()
		}, process.env)
	};
	console.log('call lean-cloud script - %s.', APP_PATH + 'server.js');
	return platformExternalSpawn('node', [APP_PATH + 'server.js'], options);
};

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
