function run(){
	avosrun('npm install').then(function (){
		console.log('success...');
	}, function (){
		console.log.apply(console.log, arguments);
	});
}
try{
	var avosrun = require('./avrun.js');
	run();
} catch(e){
	console.log('run npm install promise');
	var p = require('child_process').exec('npm install promise');
	p.on("exit", function (code){
		console.log('npm complete with code ' + code);
		if(code == 0){
			var avosrun = require('./avrun.js');
			run();
		} else{
			console.log("no module 'promise'. please install it.");
		}
	});
}
