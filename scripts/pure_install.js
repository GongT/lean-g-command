module.exports = function (cb){
	var packages = Array.prototype.slice.call(arguments, 1);
	console.log('npm install %s...', packages);
	var cmd, args;
	if(/^win/.test(process.platform)){
		cmd = 'cmd';
		args = ['/C', 'npm', 'install'].concat(packages);
	} else{
		cmd = 'npm';
		args = ['install'].concat(packages);
	}
	require('child_process').spawn(cmd, args, {
		stdio: "inherit"
	}).on('exit', function (e){
		cb(e);
	});
};
