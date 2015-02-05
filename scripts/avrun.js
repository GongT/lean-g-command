var Promise = require('promise');
module.exports.runner = require('path').resolve(APPPATH, './node_modules/avoscloud-code/bin/run.js');
if(!module.exports.runner){
	console.error("Cannot find avoscloud-code.");
	process.exit(-1);
}
module.exports = function (){
	var args = Array.prototype.slice.call(arguments);
	return new Promise(function (resolve, reject){
		console.log('call lean-cloud script - %s %s.', exports.runner,args[0]);
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
		console.log('start external program - %s', cmd);
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

module.exports.runner = require('path').resolve(ROOT, '../avoscloud-code/bin/run.js');
