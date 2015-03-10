// var AV = Object.AV;
var vm = require('vm');

module.exports = init;
function init(app){
	if(!process.env.DEBUG){
		return;
	}
	console.log('starting server with debug console...');
	global.AV = AV;
	process.stdout.isTTY = true;
	process.stdin.removeAllListeners('data');
	process.stdout.removeAllListeners('data');
	var repl = global.repl = require('repl').start({
		prompt         : 'AVOS> ',
		input          : process.stdin,
		output         : process.stdout,
		useGlobal      : true,
		terminal       : true,
		ignoreUndefined: true,
		eval           : notDefaultEval
	});
	var rli = repl.rli;
	rli.removeAllListeners('SIGINT');
	var sawSIGINT = false;
	rli.on('SIGINT', function (){
		var empty = rli.line.length === 0;
		rli.clearLine();
		if(!(repl.bufferedCommand && repl.bufferedCommand.length > 0) && empty){
			if(sawSIGINT){
				// console.error('\ueeee\rchild: will exit with double ctrl+c');
				process.exit(9);
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
	console.log('\r\x1B[38;5;14mrepl started\x1B[0m');
	
	var http = require('http');
	var realResponse = http.ServerResponse.prototype.end;
	
	http.ClientRequest.prototype.end =
	http.OutgoingMessage.prototype.end =
	http.ServerResponse.prototype.end = shimResponse;
	
	http.ClientRequest.prototype.__end =
	http.OutgoingMessage.prototype.__end =
	http.ServerResponse.prototype.__end = realResponse;
	
	console.log('\r\x1B[38;5;14mhttp.OutgoingMessage has been replaced!\x1B[0m');
	
	if(AV.CONFIG.lean.template && AV.CONFIG.lean.template == 'smarty'){
		app.use(function (_1, _2, next){
			AV.nsmarty.clearCache();
			next();
		});
	}
	
	Object.defineProperty(global, 'rs', {
		get: function (){
			console.error('restarting server');
			process.exit(100);
		}
	});
	
	define_global_helpers();
	
	setTimeout(function (){
		repl.displayPrompt();
	},1000);
}

var JsOrCss = /\.(js|css)$/;
function shimResponse(data, encoding){
	try{ // out going message no this.req 
		if(this.finished){
			console.error(this.req.originalUrl + 'multiple call to response.end()\n' +
			              this.lastcallstack + '\n' + (new Error('本次调用')).stack);
		}
		this.lastcallstack = (new Error('上次调用')).stack;
		if(!JsOrCss.test(this.req.url)){
			if(this.statusCode != 200){
				process.stderr.write('\x1B[38;5;9m');
			}
			process.stdout.write('\rI: ' + this.req.method + ' ' + this.req.url + ' ' + this.statusCode + '\n');
			if(this.statusCode != 200){
				process.stderr.write('\x1B[0m');
			}
		}
		repl.displayPrompt();
	} catch(e){
		process.stderr.write('\x1B[38;5;8m');
		process.stdout.write('\rO: ' + this.method + ' ' + this.path + '\n');
		process.stderr.write('\x1B[0m');
	}
	return this.__end();
}

function define_global_helpers(){
}

function notDefaultEval(code, context, file, cb){
	var err, result;
	// first, create the Script object to check the syntax
	if(code.length < 4){ // (\n)
		return cb(null, undefined);
	}
	try{
		var script = vm.createScript(code, {
			filename     : file,
			displayErrors: false
		});
	} catch(e){
		console.error('parse error %j', code, e);
		if(isRecoverableError(e)){
			err = new Recoverable(e);
		} else{
			err = e;
		}
	}
	
	if(err){
		if(err && err.stack){
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
			if(err && err.stack){
				console.error(err.stack.replace(/at REPLServer\.eval_handler[\S\s]+/, '').trim());
			}
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
}
