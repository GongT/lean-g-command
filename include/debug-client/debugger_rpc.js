var vm = require('vm');

module.exports = function script_runner(){
	var pipe = require('fs').ReadStream('parent', {fd: 3, mode: 'r'});
	var scripts = '';
	pipe.on('data', function (data){
		scripts += data;
		var slices = scripts.split(/\0/);
		var last = slices.pop();
		slices.forEach(function (code){
			// console.log('run script: ', code)
			try{
				vm.runInThisContext(code, {displayErrors: false});
			} catch(e){
				console.error('Child: RemoteDebugCall Failed(1): ' + e.stack);
			}
		});
		if(last){
			try{
				// console.log('run script: ', last)
				var script = vm.createScript(last, {
					filename     : 'rpc',
					displayErrors: false
				});
				script.runInThisContext({displayErrors: false});
			} catch(e){
				if(isRecoverableError(e)){
					scripts = last;
				} else{
					console.error('Child: RemoteDebugCall Failed(2): ' + e.stack);
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
