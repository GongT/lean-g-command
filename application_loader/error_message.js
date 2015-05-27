var AV = global.AV;
var fs = require('fs');
var last_code = -1;
var script = [];
global.appLoaderLog += 'load errors...\n';

var errorList = JSON.parse(fs.readFileSync(AV.LEANG_PATH + 'errormessage.json', 'utf-8'));
errorList.forEach(function (e, index){
	e.unshift(-index - 50);
});

if(fs.existsSync(AV.APP_PATH + 'errormessage.json')){
	var ue = JSON.parse(fs.readFileSync(AV.APP_PATH + 'errormessage.json', 'utf-8'));
	errorList = errorList.concat(ue);
} else{
	console.error('no message.json');
}

errorList.forEach(function (item){
	var code, name, message;
	if(typeof item[0] == 'number'){
		if(last_code >= item[0]){
			throw new Error('错误的错误码顺序');
		}
		last_code = code = item.shift();
	} else{
		code = ++last_code;
	}
	name = item[0];
	message = item[1];
	
	module.exports[name] = AV.ApiError.create(code, name, message);
});

global.appLoaderLog += 'errors loaded: ' + Object.keys(module.exports).join(', ') + '\n';
