var vm = require('vm');
try{
	var console = new LogPrepend('RPC-S');
} catch(e){
	console = new AV.Logger('RPC-C');
}

module.exports = function (stream){
	var scripts = '';
	stream.on('data', function (data){
		scripts += data;
		var slices = scripts.split(/\0/);
		var last = slices.pop();
		slices.forEach(function (code){
			// console.log('run script: ', code);
			try{
				vm.runInThisContext(code, {displayErrors: false});
			} catch(e){
				console.error(e.stack);
				console.error('运行的命令为：' + code);
			}
		});
		if(last){
			try{
				// console.log('run script: ', last);
				var script = vm.createScript(last, {
					filename     : 'rpc',
					displayErrors: false
				});
				script.runInThisContext({displayErrors: false});
			} catch(e){
				if(isRecoverableError(e)){
					scripts = last;
				} else{
					console.error(e.stack);
					console.error('运行的命令为：' + last);
				}
			}
		}
	});
};

function isRecoverableError(e){
	return e &&
	       e.name === 'SyntaxError' &&
	       /^(Unexpected end of input|Unexpected token )/.test(e.message);
}
