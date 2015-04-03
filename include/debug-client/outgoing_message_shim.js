var http = require('http');
var fs = require('fs');
var realResponse = http.ServerResponse.prototype.end;

http.ClientRequest.prototype.end =
http.OutgoingMessage.prototype.end =
http.ServerResponse.prototype.end = shimResponse;
/*
 http.ClientRequest.prototype.__end =
 http.OutgoingMessage.prototype.__end =
 http.ServerResponse.prototype.__end = realResponse;
 */
var successCode = [200, 301, 302, 304];
function shimResponse(data, encoding){
	var ret;
	if(this.req){
		process.stdout.write('\r\x1B[K');
		var skip = false;
		if(this.finished){
			console.error(this.req.originalUrl + 'multiple call to response.end()\n' +
			              this.lastcallstack + '\n' + (new Error('本次调用')).stack);
		}
		
		ret = realResponse.apply(this, arguments);
		
		this.lastcallstack = (new Error('上次调用')).stack;
		if(successCode.indexOf(parseInt(this.statusCode)) == -1){
			process.stdout.write('\r\x1B[38;5;9m');
		} else if(this.runtime){
			if(this.runtime._tVar.status == 0){
				process.stdout.write('\r\x1B[38;5;2m');
			} else{
				process.stdout.write('\r\x1B[38;5;3m');
			}
		} else{
			if(fs.existsSync('public' + this.req.url.split(/\?/)[0])){
				skip = true;
				process.stdout.write('\r\x1B[2m');
			} else{
				process.stdout.write('\r\x1B[38;5;14m');
			}
		}
		process.stdout.write('I: ' + this.req.method + ' ' + decodeURI(this.req.url) + ' ' + this.statusCode);
		if(this.runtime && this.runtime._tVar.status != 0){
			process.stdout.write(' -> ' + this.runtime._tVar.status + ': ' + this.runtime._tVar.message);
		}
		process.stdout.write('\x1B[0m' + (skip? '\r' : '\n'));
		repl.displayPrompt();
	} else{
		ret = realResponse.apply(this, arguments);
		
		process.stdout.write('');
		process.stdout.write('\r\x1B[K\x1B[38;5;244mO: ' + this.method + ' ' + this.path);
		if(this._hasBody){
			var out = this.output.join('').replace(this._header, '');
			if(out.substr(0, 1) == '{'){
				process.stdout.write(' Body: ' + remove_extra(out));
			} else{
				process.stdout.write(' Body: ** not json data (length = ' + out.length + ') **');
			}
		}
		process.stdout.write('\x1B[0m\n');
	}
	return ret;
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
	delete data._SessionToken;
	
	return JSON.stringify(data).substr(0, 26);
}
