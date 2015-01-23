var Promise = require('promise');
module.exports = function (){
	var args = arguments;
	return new Promise(function (resolve, reject){
		console.log('run git pull...');
		require('child_process').spawn('git', ['pull'], {
			stdio: 'inherit'
		}).on("exit", function (code){
			if(code == 0){
				resolve();
			} else{
				console.log("sub command failed with code " + code);
				reject();
			}
		});
	});
};
