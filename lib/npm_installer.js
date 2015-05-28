module.paths.push(process.cwd() + "/node_modules");

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
	}).status;
};
module.exports.confirm = function (req, pack){
	try{
		require(req);
		return true;
	} catch(e){
		var why = e.message;
		if(why.indexOf("Cannot find module '" + req + "'") == -1){
			console.error('不能正常 require(%s) ...\n%s\n----------', req, e.stack);
			return false;
		}
		
		console.info('Cannot require %s becouse: %s\n正在安装依赖 %s...', req, why, pack || req);
		var exit = module.exports(pack || req);
		console.log('install return', exit);
		if(exit === 0){
			try{
				require(req);
				console.info('%s 安装成功！', pack || req);
				return true;
			} catch(e){
				console.error('无法安装依赖 %s ...', pack || req);
				console.error(e.trace);
				return false;
			}
		} else{
			return false;
		}
	}
};
