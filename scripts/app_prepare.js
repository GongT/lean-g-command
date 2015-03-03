var local = false;
var fs = require('fs');
var CLOUDROOT, GROOT, APPPATH, GENPATH;

module.exports = DEPLOY;
console.error('prepare deploy files');
function DEPLOY(AV, _require){
	Object.AV = AV;
	try{
		process.env.TZ = 'UTC';
		local = AV.localhost = true;
		GROOT = AV.GROOT = 'cloud/lean-g/';
		CLOUDROOT = AV.CLOUDROOT = 'cloud/';
		GENPATH = AV.GENPATH = CLOUDROOT + '__gen/';
		APPPATH = AV.APPPATH = '';
		console.log('start deploy on localhost.');
	} catch(e){
		local = AV.localhost = false;
		GROOT = AV.GROOT = 'cloud/lean-g/';
		CLOUDROOT = AV.CLOUDROOT = 'cloud/';
		GENPATH = AV.GENPATH = CLOUDROOT + '__gen/';
		APPPATH = AV.APPPATH = '';
		console.log('start deploy on leancloud server.');
	}
	
	AV.require = _require;
	AV.fatal = function (errormessage){
		errormessage = errormessage || '';
		try{
			process.stderr.write('部署失败:\n' + errormessage.trim() + '\n');
			process.exit(10);
		} catch(e){
			throw new Error('部署失败:\n' + errormessage.trim());
		}
	};
	try{
		var app = main(AV);
		delete AV.fatal;
		return app;
	} catch(e){
		AV.fatal(e.stack);
	}
}

function main(AV){
	var require = AV.require;
	var express = AV.express = require('express');
	var app = express();
	
	append_log('load config...');
	var CONFIG = AV.CONFIG = require(GENPATH + 'config.js');
	AV.isDebugEnv = CONFIG.isDebugEnv;
	
	append_log('load library (libload apierror prototype)...');
	AV.lib = AV.library = require(GROOT + 'include/library_loader.js');
	AV.ApiError = require(GROOT + 'include/ApiError.js');
	AV.CLS = require(GROOT + 'include/module.prototype.js');
	
	append_log('load errors...');
	AV.E = require(GENPATH + 'error.js');
	append_log('errors loaded: ' + Object.keys(AV.E).join(', '));
	
	append_log('load library (checker)...');
	AV.InputChecker = require(GROOT + 'include/InputChecker.js');
	var types = require(GROOT + 'include/InputChecker.types.js');
	for(var n in types){
		AV.InputChecker.register(n, types[n]);
	}
	
	append_log('load library (logger controller cloudcode servercloud)...');
	AV.Logger = require(GROOT + 'include/Logger.js');
	AV.ExpressController = require(GROOT + 'include/ExpressController.js');
	AV.CloudCodeWrapper = require(GROOT + 'include/CloudCodeWrapper.js');
	AV.ServerCloud = require(GROOT + 'include/ServerCloud.js');
	
	append_log('load constants...');
	AV.CONSTANTS = require(GENPATH + 'import.jsconst.js');
	
	append_log('load cloudcode functions...');
	require(GROOT + 'include/global-functions.js');
	
	// 开始启动
	append_log('load custom code...');
	require(GENPATH + 'import.librarys.js');
	require(GENPATH + 'import.modules.js');
	require(GENPATH + 'import.functions.js');
	require(GENPATH + 'import.triggers.js');
	
	if(local){
		AV.Cloud.define("__create_inspect", require(GROOT + 'include/InspectCC.js'));
	}
	
	append_log('load express app...');
	var avosExpressCookieSession = require('avos-express-cookie-session');
	
	// App 全局配置
	app.use(express.compress());
	app.set('env', local? 'development' : 'production');
	app.set('x-powered-by', false);
	app.set('lib', AV.lib);
	app.use(express.bodyParser());
	
	if(fs.existsSync('public/favicon.ico')){
		app.use(require('serve-favicon')('public/favicon.ico'));
	}
	
	app.use(require('less-middleware')('public'));
	
	//启用cookie 1小时
	app.use(express.cookieParser('gfx'));
	app.use(avosExpressCookieSession({
		cookie: {maxAge: 1000*60*60*24*360},
		key   : CONFIG.sessionKey || 'NODESESSID'
	}));
	
	if(local){
		append_log('load debug client...');
		var debug = require(GROOT + 'include/debug-client.js')(app);
	}
	
	AV.server = app;
	console.log(CONFIG);
	if(!CONFIG.lean.template || CONFIG.lean.template == 'ejs'){
		app.set('views', 'views');
		app.set('view engine', 'ejs');
	} else if(CONFIG.lean.template == 'smarty'){
		append_log('load express smarty template...');
		AV.templatePlugin = require(GROOT + 'include/express-nsmarty-shim.js');
		require(GENPATH + 'import.nsmarty.js').forEach(function (f){
			AV.templatePlugin.parseFile(f);
		});
	} else{
		throw new Error("未知模板引擎：" + CONFIG.lean.template);
	}
	
	append_log('load express routers...');
	require(GENPATH + 'import.express.js');
	
	append_log('loader complete...');
	
	end_log();
	return app;
}

var deploylog = '', deploylogtimer;
function start_log(){
	if(deploylogtimer){
		clearTimeout(deploylogtimer);
	}
	deploylogtimer = setTimeout(function (){
		console.error(deploylog);
		deploylog = '';
	}, 2000);
}
function end_log(){
	if(deploylogtimer){
		clearTimeout(deploylogtimer);
	}
	deploylog = deploylogtimer = undefined;
}
function append_log(msg){
	deploylog += msg + '\n';
	start_log();
}
