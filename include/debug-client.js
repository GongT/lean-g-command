module.exports = init;
function init(app){
	if(process.env.DEBUG){
		return;
	}
	global.AV = Object.AV;
	process.stdout.isTTY = true;
	var repl = global.repl = require('repl').start({
		prompt         : 'AVOS> ',
		input          : process.stdin,
		output         : process.stdout,
		useGlobal      : true,
		ignoreUndefined: true
	});
	var rli = repl.rli;
	rli.removeAllListeners('SIGINT');
	var sawSIGINT = false;
	rli.on('SIGINT', function (){
		var empty = rli.line.length === 0;
		rli.clearLine();
		if(!(repl.bufferedCommand && repl.bufferedCommand.length > 0) && empty){
			if(sawSIGINT){
				console.error('\ueeee\rexit with code ctrl+c');
				process.stdin.resume();
				process.stdout.pause();
				process.stderr.pause();
				process.exit();
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
	// console.log('\r\x1B[38;5;14mrepl started\x1B[0m');
	
	process.stdin.resume();
	
	setTimeout(function (){
		repl.displayPrompt();
	}, 0);
	
	var http = require('http');
	var realResponse = http.ServerResponse.prototype.end;
	
	http.ClientRequest.prototype.end =
	http.OutgoingMessage.prototype.end =
	http.ServerResponse.prototype.end = shimResponse;
	
	http.ClientRequest.prototype.__end =
	http.OutgoingMessage.prototype.__end =
	http.ServerResponse.prototype.__end = realResponse;
	
	// console.log('\r\x1B[38;5;14mhttp.OutgoingMessage has been replaced!\x1B[0m');
	
	var nsm = require('nsmarty');
	app.use(function (_1, _2, next){
		nsm.clearCache();
		next();
	});
	
	Object.defineProperty(global, 'rs', {
		get: function (){
			console.error('restarting server');
			process.exit(100);
		}
	});
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
