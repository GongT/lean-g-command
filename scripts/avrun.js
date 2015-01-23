var Promise = require('promise');
module.exports = function (){
	var args = arguments;
	return new Promise(function (resolve, reject){
		console.log('call lean-cloud script `%s`...', args[0]);
		console.log(ROOT + '/node_modules/avoscloud-code/bin/avoscloud');
		var p = require('child_process').spawn(ROOT + '/node_modules/avoscloud-code/bin/avoscloud',
				Array.prototype.slice.call(args),
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
module.exports.external = function (cmd, args){
	return new Promise(function (resolve, reject){
		var p = require('child_process').spawn(cmd,
				args || [],
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
