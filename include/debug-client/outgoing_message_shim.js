var http = require('http');
var realResponse = http.ServerResponse.prototype.end;

http.ClientRequest.prototype.end =
http.OutgoingMessage.prototype.end =
http.ServerResponse.prototype.end = shimResponse;

http.ClientRequest.prototype.__end =
http.OutgoingMessage.prototype.__end =
http.ServerResponse.prototype.__end = realResponse;

console.log('\r\x1B[38;5;14mhttp.OutgoingMessage has been replaced!\x1B[0m');

var successCode = [200, 301, 302, 304];
var JsOrCss = /\.(js|css)$/;
function shimResponse(data, encoding){
	try{ // out going message no this.req 
		if(this.finished){
			console.error(this.req.originalUrl + 'multiple call to response.end()\n' +
			              this.lastcallstack + '\n' + (new Error('本次调用')).stack);
		}
		this.lastcallstack = (new Error('上次调用')).stack;
		if(!JsOrCss.test(this.req.url)){
			if(successCode.indexOf(parseInt(this.statusCode)) == -1){
				process.stderr.write('\x1B[38;5;9m');
			}
			process.stdout.write('\rI: ' + this.req.method + ' ' + this.req.url + ' ' + this.statusCode + '\n');
			if(successCode.indexOf(parseInt(this.statusCode)) == -1){
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
