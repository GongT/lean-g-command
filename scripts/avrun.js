var Promise = require('promise');

module.exports = function (){
	var args = Array.prototype.slice.call(arguments);
	return new Promise(function (resolve, reject){
		console.log('call lean-cloud script - %s', args[0]);
		console.log(args)
		var p = require('child_process').spawn(exports.runner,
				args,
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
module.exports.external = function (cmd){
	return new Promise(function (resolve, reject){
		var p = require('child_process').exec(cmd);
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

module.exports.runner = require('path').resolve(ROOT, '../avoscloud-code/bin/run.js')
