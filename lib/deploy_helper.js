var fs = require('fs');

module.exports.prepare = function (){
	if(APP_CONFIG.blockDeploy){
		console.error('\x1B[38;5;14m%s\x1B[0m不允许部署，它可能仅用于本地调试。', APP_CONFIG.applicationName);
		process.exit(9);
	}
	require('lean-g-loader').createServerConfig();
};

module.exports.do_upload = function do_upload(){
	process.env.TMPDIR = process.env.TEMP = TEMP_PATH + 'uploaded/';
	fs.readdirSync(process.env.TMPDIR).forEach(function (file){
		if(/[0-9]+\.zip/.test(file)){
			fs.unlinkSync(process.env.TMPDIR + file);
		}
	});
	return LeanFork.promise('deploy');
};

module.exports.do_publish = function do_publish(){
	return new Promise(function (resolve, reject){
		setTimeout(function (){
			return LeanFork.promise('publish').then(resolve, reject);
		}, 3000);
	});
};
