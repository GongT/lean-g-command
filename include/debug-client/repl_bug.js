var fs = require('fs'), vm = require('vm');

module.exports.ctrl_c = function (){
	var rli = repl.rli;
	
	rli.removeAllListeners('SIGINT');
	var sawSIGINT = false;
	rli.on('SIGINT', function (){
		var empty = rli.line.length === 0;
		rli.clearLine();
		if(!(repl.bufferedCommand && repl.bufferedCommand.length > 0) && empty){
			if(sawSIGINT){
				debug_shutdown();
				return;
			}
			rli.output.write('(^C again to quit)\n');
			sawSIGINT = true;
		} else{
			sawSIGINT = false;
		}
		
		repl.bufferedCommand = '';
		repl.displayPrompt();
	});
	rli.on('line', function (){
		sawSIGINT = false;
	});
};

module.exports.eval = function notDefaultEval(code, context, file, cb){
	var err, result;
	// first, create the Script object to check the syntax
	if(code.length < 4){ // (\n)
		return cb(null, undefined);
	}
	if(special_command(code)){
		return cb();
	}
	try{
		var script = vm.createScript(code, {
			filename     : file,
			displayErrors: false
		});
	} catch(e){
		if(isRecoverableError(e)){
			err = new Recoverable(e);
		} else{
			console.error('[repl] 输入的命令解析失败 %s', e);
			err = e;
		}
	}
	
	if(err){
		if(err && !err instanceof  Recoverable && err.stack){
			console.error(err.stack.replace(/at REPLServer\.eval_handler[\S\s]+/, '').trim());
		}
	} else{
		try{
			if(true){
				result = script.runInThisContext({displayErrors: false});
			} else{
				result = script.runInContext(context, {displayErrors: false});
			}
		} catch(e){
			err = e;
			err.stack = err.stack.replace(/at REPLServer\.eval_handler[\S\s]+/, '').trim();
			if(err && process.domain){
				process.domain.emit('error', err);
				process.domain.exit();
				return;
			}
		}
	}
	
	if(AV.Promise.is(result)){
		result.done(function (data){
			cb(undefined, data);
		}, function (err){
			cb(err, undefined);
		});
	} else{
		cb(err, result);
	}
};
function isRecoverableError(e){
	return e &&
	       e.name === 'SyntaxError' &&
	       /^(Unexpected end of input|Unexpected token )/.test(e.message);
}
function Recoverable(err){
	this.err = err;
}

require('util').inherits(Recoverable, SyntaxError);

function special_command(code){
	code = code.trim();
	code = code.substr(1, code.length - 2);
	if(/^debug/.test(code)){
		if(/^debug show$/.test(code)){
			
		}
		return true;
	}
}
