var fs = require('fs');
var path = require('path');
var readline = require('readline');
var extend = require('util')._extend;

var cfgname = process.argv[3] || 'development';
if(cfgname == 'global' || cfgname == 'config'){
	console.error('Error: the config files cannot name with "config" or "global".');
	process.exit(1);
}
if(!/^[a-z]+$/.test(cfgname)){
	console.error('Error: the config file name can only use lower case letters.');
	process.exit(1);
}

var CONFIG = {};
var dcfgfile = path.resolve(APPPATH + 'config/default.json');
if(fs.existsSync(dcfgfile)){
	CONFIG = require(dcfgfile);
}

var cfgfile = path.resolve(APPPATH + 'config/' + cfgname + '.json');
if(fs.existsSync(cfgfile)){
	extend(CONFIG, require(cfgfile));
}
var rl = readline.createInterface({
	input : process.stdin,
	output: process.stdout
});

var questions = {
	"applicationName": ["请输入应用程序的名称，主要用于调试（，其实这没什么用）。"],
	"applicationId"  : ["输入应用的 App Id（在后台-设置-应用Key中查看）"],
	"applicationKey" : ["输入应用的 App Key（在后台-设置-应用Key中查看）"],
	"masterKey"      : ["输入应用的 Master Key（在后台-设置-应用Key中查看）"],
	"baseUrl"        : ["网站的根域名（和目录）"],
	"staticUrl"      : ["保存静态文件的URL（如果你需要将静态文件放在其他地方）"],
	"staticVersion"  : ["保存静态文件的URL（如果你需要将静态文件放在其他地方）"],
	"isDebugEnv"     : ["改配置是否是测试环境？（yes/no）", function (d){
		d = d.toLowerCase();
		if(d == 'yes'){
			return true;
		} else if(d == 'no'){
			return false;
		}
	}
	],
	"cookieDomain"   : ["保存cookie的域，默认是请求的域名"],
	"cookiePath"     : ["保存cookie的路径，默认是根目录"],
	"sessionKey"     : ["保存session的cookie变量名"]
};
var qids = Object.keys(questions);
var current = -1;

console.log('* 中括号里是当前值，如果直接按下回车，则继续使用那个值。\n');
next();

function ask(){
	var vname = qids[current];
	var c = questions[vname];
	var must = CONFIG[vname] === undefined;
	rl.question(c[0] + ' [' + (must? '必填' : CONFIG[vname]) + ']\n> ', function (answer){
		if(answer.length == 0){
			if(must){
				return ask();
			} else{
				return next();
			}
		}
		if(c[1]){
			answer = c[1](answer);
			if(answer === undefined){
				console.error('invalid input');
				return ask();
			}
		}
		CONFIG[vname] = answer;
		next();
	});
}

function next(){
	current++;
	if(current >= qids.length){
		save();
	} else{
		ask();
	}
}

function save(){
	var file = JSON.stringify(CONFIG, null, 8).replace(/^ +/mg, function (s){
		var sp = '';
		s = parseInt(s.length/8);
		while(s-- > 0){
			sp += '\t';
		}
		return sp
	});
	fs.writeFileSync(cfgfile, file);
	console.log('配置成功！\n%s\n', file);
	
	if(fs.existsSync(APPPATH + 'package.json')){
		var pkg = require(APPPATH + 'package.json');
		pkg.description = CONFIG.applicationName;
		fs.writeFileSync(APPPATH + 'package.json', JSON.stringify(pkg, null, 8).replace(/^        /mg, '\t'));
	}
	
	rl.close();
}
