var fs = require('fs');
var path = require('path');
var readline = require('readline');
var extend = require('util')._extend;
var DEFAULT_CONFIG = {
	"template": {
		"standardErrorPage": "global/standard.tpl",
		"internalErrorPage": "global/internal.tpl",
		"userErrorPage"    : "global/user.tpl"
	}
};

var CurrentConfigFile = process.argv[3];
var CONFIG;
if(CurrentConfigFile){
	try{
		CONFIG = load_config_file(CurrentConfigFile) || extend({}, DEFAULT_CONFIG);
	} catch(e){
		console.error(e);
		process.exit(1);
	}
	console.log('已加载配置文件 %s.json ', CurrentConfigFile);
} else{
	CONFIG = extend({}, DEFAULT_CONFIG);
	console.log('\x1B[38;5;14;6m没有提供配置文件名，将通过环境类型自动判断。\x1B[0m');
}

var rl = readline.createInterface({
	input : process.stdin,
	output: process.stdout
});
function terminate_process(){
	rl.clearLine();
	rl.close();
	process.exit(0);
}
var sawSIGINT = false, saving = false, terminate_saveing = false;
rl.on('SIGINT', function (){
	if(terminate_saveing){
		return terminate_process();
	}
	if(saving){
		saving = false;
		return ask();
	}
	if(sawSIGINT){
		terminate_saveing = true;
		save(true, function (f){
			if(f){
				terminate_process();
			} else{
				ask();
			}
		});
		return;
	}
	rl.line = '';
	rl.prompt();
	sawSIGINT = true;
});
rl.input.on('data', function (d){
	if(d[0] != 3){
		sawSIGINT = false;
	}
});
rl.question = function (query, cb){
	if(typeof cb == 'function'){
		if(this._questionCallback){
			this.prompt();
		} else{
			this._oldPrompt = this._prompt;
			this.setPrompt(query);
			this._questionCallback = cb;
			this.prompt();
		}
	}
};

var questions = {
	"_configtype"    : {
		title: "本环境属于（输入序号）\n" +
		     "\t1: 本地开发环境\n" +
		     "\t2: 正式部署环境（部署到正式库）\n" +
		     "\t3: 测试环境（部署到测试库）\n" +
		     "\t4: 本地测试环境（用测试数据库进行本地调试）\n" +
		     "\t5: 远程调试环境（用正式数据库进行本地调试）",
		input: load_old_config
	},
	"applicationName": {
		title: "请输入应用程序的名称，主要用于调试（，其实这没什么用）。"
	},
	"applicationId"  : {
		title: "输入应用的 App Id（在后台-设置-应用Key中查看）"
	},
	"applicationKey" : {
		title: "输入应用的 App Key（在后台-设置-应用Key中查看）"
	},
	"masterKey"      : {
		title: "输入应用的 Master Key（在后台-设置-应用Key中查看）"
	},
	"baseUrl"        : {
		title: "网站的根域名 - http://[****].avosapps.com/ 中的****部分（也可以输入一个http://开头的完整域名）", input: function (url){
			if(!url){
				return;
			}
			url = url.toLowerCase();
			if(/^https?:\/\//.test(url)){
				return /\/$/.test(url)? url : url + '/';
			} else{
				return 'http://' + url + '.avosapps.com/';
			}
		}
	},
	"staticUrl"      : {
		title  : "保存静态文件的URL（如果你需要将静态文件放在其他地方）",
		default: "/"
	},
	"cookieDomain"   : {
		title: "保存cookie的域，默认是baseUrl",
		input: function (data){
			if(data){
				if(/^\./.test(data)){
					return '.' + data;
				}
				return data;
			} else{
				var m = /^http:\/\/(.*?)\//.exec(CONFIG.baseUrl);
				if(m){
					return '.' + m[1];
				}
			}
		}
	},
	"cookiePath"     : {
		title  : "保存cookie的路径，默认是根目录",
		default: '/'
	},
	"sessionKey"     : {
		title  : "保存session的cookie变量名",
		default: 'NODESESSID'
	},
	"AppSource"      : {
		title: "当前应用在leancloud账户下的唯一id，可以随意设置（但必须是大于0的整数）",
		input: function (v){
			v = parseInt(v);
			return v > 0? v : undefined;
		}
	},
	"staticVersion"  : {
		title  : "静态文件版本号",
		default: '0'
	}
};
var qids = Object.keys(questions);
var current = -1;

console.log('');
console.log('* 中括号里是当前值，如果直接按下回车，则继续使用那个值。');
console.log('* 按下\x1B[38;5;9mCtrl+C\x1B[0m取消当前收入，连按两次取消配置');
console.log('');
next();

function ask(){
	var vname = qids[current];
	var c = questions[vname];
	if(!CONFIG[vname] && c.hasOwnProperty('default')){
		CONFIG[vname] = c.default;
	}
	var must = !CONFIG[vname];
	var input_filter = c.input;
	rl._questionCallback = null;
	rl.question(c.title + ' [' + (must? '必填' : CONFIG[vname]) + ']\n> ', function (answer){
		var filterd;
		if(answer.length == 0){
			if(must){
				if(input_filter){
					filterd = input_filter.call(CONFIG, answer);
					if(filterd === undefined){
						console.error('invalid input "' + answer + '"');
						return ask();
					}
				} else{
					return ask();
				}
			} else{
				return next();
			}
		}
		if(input_filter){
			filterd = input_filter.call(CONFIG, answer);
			if(filterd === undefined){
				console.error('invalid input "' + answer + '"');
				return ask();
			}
		}
		CONFIG[vname] = filterd || answer;
		next();
	});
}

function next(){
	current++;
	if(current >= qids.length){
		save(false, function (){
			rl.close();
		});
	} else{
		ask();
	}
}

function ksort(data){
	var obj = {};
	Object.keys(data).sort(function (a, b){
		if(/^_/.test(a)){
			return 1;
		}
		if(/^_/.test(b)){
			return -1;
		}
		return a == b? 0 : a > b? 1 : -1;
	}).forEach(function (n){
		obj[n] = data[n];
	});
	return obj;
}
function getConfigData(CONFIG){
	return JSON.stringify(CONFIG, null, 8).replace(/^ +/mg, function (s){
		var sp = '';
		s = parseInt(s.length/8);
		while(s-- > 0){
			sp += '\t';
		}
		return sp
	})
}

function save(askover, callback){
	saving = true;
	var cb = function (d){
		saving = terminate_saveing = false;
		if(callback){
			callback(d);
		}
	};
	if(CurrentConfigFile){
		CONFIG = ksort(CONFIG);
		var fileData = getConfigData(CONFIG);
		var done = function (config_file){
			fs.writeFileSync(config_file, fileData);
			console.log('配置成功！\n    %s\n', require('util').inspect(CONFIG, {colors: true, depth: 5}));
			console.log('  现在可以使用 `' + process.argv[1] + ' ' + CurrentConfigFile + ' debug` run your code.');
			cb(config_file);
		};
		if(askover){
			confirm_overwrite(CurrentConfigFile, done, cb);
		} else{
			var configFile = path.resolve(APPPATH + 'config/' + CurrentConfigFile + '.json');
			return done(configFile);
		}
	} else{
		var request_cfgname = function (){
			rl._questionCallback = null;
			var termAlert = terminate_saveing? '，再按一次Ctrl+C不保存退出' : '';
			rl.question('\r无法推测配置文件名，请输入' + termAlert + '\n$ ', function (saveFileName){
				if(!saveFileName){
					return request_cfgname();
				}
				try{
					CONFIG = extend(load_config_file(saveFileName), CONFIG);
				} catch(e){
					console.error(e.message);
					return request_cfgname();
				}
				confirm_overwrite(saveFileName, function (){
					CurrentConfigFile = saveFileName;
					save(false, cb);
				}, cb);
			});
		};
		request_cfgname();
	}
}
function confirm_overwrite(CurrentConfigFile, yes, no){
	var config_file = path.resolve(APPPATH + 'config/' + CurrentConfigFile + '.json');
	if(fs.existsSync(config_file)){
		rl._questionCallback = null;
		rl.question('覆盖配置' + CurrentConfigFile + '？（Y/N）\n$ ', function (answer){
			answer = yes_or_no(answer);
			if(answer === undefined){
				return confirm_overwrite();
			}
			if(answer){
				yes(config_file);
			} else{
				no();
			}
		});
	} else{
		yes(config_file);
	}
}

function yes_or_no(input){
	input = input.toLowerCase();
	if(input == 'yes' || input == 'y'){
		return true;
	} else if(input == 'no' || input == 'n'){
		return false;
	}
}

function load_old_config(v){
	if(v.length == 0){
		return;
	}
	var code = parseInt(v);
	if(code != v){
		return;
	}
	var defaultConfigName;
	switch(code){
	case 1:
		this.isTestEnv = false;
		this.blockDeploy = true;
		this.isDebugEnv = true;
		this.envName = '本地开发环境';
		defaultConfigName = 'development';
		break;
	case 2:
		this.isTestEnv = false;
		this.blockDeploy = false;
		this.isDebugEnv = false;
		this.envName = '正式部署环境';
		defaultConfigName = 'production';
		break;
	case 3:
		this.isTestEnv = true;
		this.blockDeploy = false;
		this.isDebugEnv = false;
		this.envName = '测试环境';
		defaultConfigName = 'test';
		break;
	case 4:
		this.isTestEnv = true;
		this.isDebugEnv = true;
		this.blockDeploy = true;
		this.envName = '本地测试环境';
		defaultConfigName = 'test_local';
		break;
	case 5:
		this.isTestEnv = false;
		this.isDebugEnv = true;
		this.blockDeploy = true;
		this.envName = '远程调试环境';
		defaultConfigName = 'remote';
		break;
	}
	
	if(!CurrentConfigFile && defaultConfigName){
		CurrentConfigFile = defaultConfigName;
		CONFIG = extend(load_config_file(CurrentConfigFile), CONFIG);
		console.log('该配置文件推荐的文件名是 %s.json，自动载入配置：\n%s', CurrentConfigFile,
				require('util').inspect(CONFIG, {colors: true, depth: 5}));
	}
	return v;
}

function load_config_file(cfgname){
	var CONFIG = extend({}, DEFAULT_CONFIG);
	var dcfgfile = path.resolve(APPPATH + 'config/default.json');
	if(fs.existsSync(dcfgfile)){
		CONFIG = require(dcfgfile);
	}
	
	if(cfgname == 'global' || cfgname == 'config'){
		throw new Error('the config files cannot name with "config" or "global".');
	}
	if(!/^[a-z]+$/.test(cfgname)){
		throw new Error('the config file name can only use lower case letters.');
	}
	
	if(!cfgname){
		return CONFIG;
	}
	
	var cfgfile = path.resolve(APPPATH + 'config/' + cfgname + '.json');
	
	if(!cfgfile){
		return CONFIG;
	}
	
	var x = {};
	if(fs.existsSync(cfgfile)){
		try{
			eval('x=' + fs.readFileSync(cfgfile, 'utf8'))
		} catch(e){
			try{
				var msg = e.stack.split('\n')[1].trim();
				var m = /:([0-9]+):([0-9]+)[^:]*$/.exec(msg);
				console.log('\x1B[38;5;9m %s 文件解析失败：\n\tError: %s\n\t行 %s\n\t列 %s\x1B[0m', cfgfile, e.message, m[1], m[2]);
			} catch(e2){
				console.log('\x1B[38;5;9m %s 文件解析失败：\n\t%s\x1B[0m\n%s', cfgfile, e, e2.stack);
			}
		}
		extend(CONFIG, x);
	} else{
		console.log('file not exists: %s', APPPATH + 'config/' + cfgname + '.json');
	}
	
	return CONFIG;
}
