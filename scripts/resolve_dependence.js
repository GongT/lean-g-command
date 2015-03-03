console.log('run npm install');
var p = require('child_process').exec('npm install');
p.on("exit", function (code){
	console.log('npm complete with code ' + code);
});
