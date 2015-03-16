module.exports = function (){
	var packages = Array.prototype.slice.call(arguments);
	console.log('npm install %s...', packages);
	var cmd, args;
	if(/^win/.test(process.platform)){
		cmd = 'cmd';
		args = ['/C', 'npm', 'install'].concat(packages);
	} else{
		cmd = 'npm';
		args = ['install'].concat(packages);
	}
	return require('child_process').spawnSync(cmd, args, {
		stdio: "inherit"
	});
};
module.exports.confirm = function (req, pack){
	try{
		global.colors = require(req);
		return true;
	} catch(e){
		console.info('正在安装依赖 %s...', pack || req);
		var exit = module.exports(pack || req);
		if(exit === 0){
			try{
				global.colors = require(req);
				console.info('%s 安装成功！', pack || req);
				return true;
			} catch(e){
				console.error('无法安装依赖 %s ...', pack || req);
				return false;
			}
		} else{
			return false;
		}
	}
};
