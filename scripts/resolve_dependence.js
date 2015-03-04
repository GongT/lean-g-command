console.log('run npm install');
var p = require('child_process').exec('npm install',
		function (error, stdout, stderr){
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if(error !== null){
				console.log('exec error: ' + error);
			}
		});
p.on("exit", function (code){
	console.log('npm complete with code ' + code);
});
