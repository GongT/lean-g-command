console.log('run npm install');
var p = require('child_process').exec('npm install');
p.on("exit", function (code){
	console.log('npm complete with code ' + code);
});
p.stdout.on("data", function (msg){
	console.log(msg);
});
p.error.on("data", function (msg){
	console.error(msg);
});
