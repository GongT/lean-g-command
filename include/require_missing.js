module.exports.parse_require_error_stack = function (stack){
	var missing_path = [];
	var lines = stack.split("\n");
	var missingModule = lines.shift();
	var requiredAt = lines.pop();
	var miss = /Error: Cannot find module '(.*)'/.exec(missingModule);
	
	if(!miss){
		return missing_path;
	}
	missingModule = miss[1];
	missing_path.push(missingModule);
	
	if(requiredAt.indexOf(CGROOT) >= 0){ // direct dependece missing
		return missing_path;
	}
	
	var subModule = /\/node_modules\/.*\//.exec(requiredAt);
	
	if(!subModule){
		missing_path.push(false);
		return missing_path;
	}
	
	var submodules = subModule[0].split('/node_modules/').filter(function (v){
		return v;
	});
	submodules.push(submodules.pop().split('/').shift());
	
	return missing_path.concat(submodules);
};

module.exports.recommand_solutions = function (missingTree){
	if(missingTree.length == 0){
		console.error('\x1B[38;5;9m检查依赖时发生预料外的错误\x1B[0m');
		return false;
	}
	
	var missingModule = missingTree.shift();
	
	console.error('发现本地缺少的依赖：\x1B[38;5;9m%s\x1B[0m', missingModule);
	
	if(missingTree.length == 0){
		console.error('  运行 \x1B[38;5;14mleang dependence resolve\x1B[0m 来安装缺少的依赖。');
		return true;
	}
	
	if(!missingTree[0]){
		console.error('\x1B[38;5;9m依赖来源不明，请手动处理\x1B[0m');
		return false;
	}
	
	/* print a tree */
	var traceTree = '';
	traceTree += '*';
	missingTree.forEach(function (n, i){
		traceTree += ' ';
		for(var x = i; x; x--){
			traceTree += '  ';
		}
		if(i){
			traceTree += '└-';
		} else{
			traceTree += ' ';
		}
		traceTree += n + '\n';
	});
	traceTree += ' ';
	for(var x = missingTree.length; x; x--){
		traceTree += '  ';
	}
	traceTree += '└-';
	traceTree += '\x1B[38;5;9m' + missingModule + '\x1B[0m';
	console.error(traceTree);
	/* print a tree END */
	
	var subpath = missingTree.map(function (){
		return '../../';
	}).join('');
	
	console.error('你可以:\n' +
	              '*  运行 - "\x1B[38;5;14mnpm install %s\x1B[0m"  命令来重新安装 \x1B[38;5;10m%s\x1B[0m 模块和它的\x1B[38;5;14m所有\x1B[0m依赖\n' +
	              '*  或者 - "\x1B[38;5;14mleang dependence\x1B[0m"  命令自动处理所有损坏和缺少的模块\n' +
	              '*  或者 - "\x1B[38;5;14mcd %s;npm install %s;cd %s\x1B[0m"  命令只安装缺少的文件',
			missingTree[0],
			missingTree[0],
			'node_modules/' + missingTree.join('/node_modules/'),
			missingModule,
			subpath
	);
	return true;
};
