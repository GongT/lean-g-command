var http = require('http');
var realResponse = http.ServerResponse.prototype.end;

http.ClientRequest.prototype.end =
http.OutgoingMessage.prototype.end =
http.ServerResponse.prototype.end = shimResponse;

http.ClientRequest.prototype.__end =
http.OutgoingMessage.prototype.__end =
http.ServerResponse.prototype.__end = realResponse;

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
			process.stdout.write('\rI: ' + this.req.method + ' ' + decodeURI(this.req.url) + ' ' + this.statusCode +
			                     '\n');
			if(successCode.indexOf(parseInt(this.statusCode)) == -1){
				process.stderr.write('\x1B[0m');
			}
		}
		repl.displayPrompt();
	} catch(e){
		process.stderr.write('\x1B[38;5;8m');
		process.stdout.write('\rO: ' + this.method + ' ' + this.path);
		if(this._hasBody){
			var out = this.output.join('').replace(this._header, '');
			if(out.substr(0, 1) == '{'){
				process.stdout.write(' Body: ' + remove_extra(out));
			} else{
				process.stdout.write(' Body: ** not json data**');
			}
		}
		process.stderr.write('\x1B[K\x1B[0m\n');
	}
	return this.__end();
}

function remove_extra(json){
	var data = JSON.parse(json);
	if(!data){
		return '** unavailable json data **';
	}
	delete data._ApplicationId;
	delete data._ApplicationKey;
	delete data._MasterKey;
	delete data._ClientVersion;
	delete data._InstallationId;
	delete data._InstallationId;
	
	return JSON.stringify(data);
}
