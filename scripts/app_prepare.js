var local = false;
var fs = require('fs'), path = require('path');
var ABS_ROOT, CLOUDROOT, GROOT, CGROOT, INTERNAL_TEMPLATE, APPPATH, GENPATH;

module.exports = DEPLOY;
console.error('prepare deploy files');
function DEPLOY(AV, _require){
	Object.AV = AV;
	try{
		process.env.TZ = 'UTC';
		local = AV.localhost = true;
		ABS_ROOT = AV.ABS_ROOT = path.resolve(process.cwd()) + '/';
		GROOT = AV.GROOT = 'cloud/lean-g/';
		CGROOT = AV.CGROOT = ABS_ROOT + 'cloud/lean-g/';
		INTERNAL_TEMPLATE = AV.INTERNAL_TEMPLATE = AV.CGROOT + 'include/debug-client/html/';
		CLOUDROOT = AV.CLOUDROOT = 'cloud/';
		GENPATH = AV.GENPATH = CLOUDROOT + '__gen/';
		APPPATH = AV.APPPATH = '';
		console.log('start deploy on localhost.');
	} catch(e){
		local = AV.localhost = false;
		ABS_ROOT = AV.ABS_ROOT = path.resolve(__dirname, '..') + '/';
		GROOT = AV.GROOT = 'cloud/lean-g/';
		CGROOT = AV.CGROOT = ABS_ROOT + 'cloud/lean-g/';
		INTERNAL_TEMPLATE = AV.INTERNAL_TEMPLATE = AV.CGROOT + 'include/debug-client/html/';
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
	var app = AV.server = express();
	
	append_log('load config...');
	var CONFIG = AV.CONFIG = require(GENPATH + 'config.js');
	AV.isDebugEnv = CONFIG.isDebugEnv;
	AV.isTestEnv = CONFIG.isTestEnv;
	if(!AV.CONFIG.template){
		AV.CONFIG.template = {};
	}
	if(!AV.CONFIG.template.standardErrorPage){
		AV.CONFIG.template.standardErrorPage = INTERNAL_TEMPLATE + 'error_page/standard_error.tpl';
	}
	if(!AV.CONFIG.template.internalErrorPage){
		AV.CONFIG.template.internalErrorPage = INTERNAL_TEMPLATE + 'error_page/internal_error.tpl';
	}
	if(!AV.CONFIG.template.userErrorPage){
		AV.CONFIG.template.userErrorPage = INTERNAL_TEMPLATE + 'error_page/user_error.tpl';
	}
	if(!AV.CONFIG.template.notFoundErrorPage){
		AV.CONFIG.template.notFoundErrorPage = INTERNAL_TEMPLATE + 'error_page/404_not_found.tpl';
	}
	
	var FS = AV.FS = require(GROOT + 'include/FileSystem.js');
	
	append_log('load error handler (remotelogger apierror)...');
	AV.Logger = require(GROOT + 'include/Logger.js');
	AV.ApiError = require(GROOT + 'include/ApiError.js');
	
	append_log('load library (libload prototype)...');
	var LibraryLoader = AV.LibraryLoader = require(GROOT + 'include/library_loader.js');
	AV.library = new LibraryLoader;
	AV.library.autoload(FS.read_source_tree('cloud/library/'));
	
	AV.CLS = require(GROOT + 'include/module.prototype.js');
	
	append_log('load errors...');
	AV.E = require(GENPATH + 'error.js');
	append_log('errors loaded: ' + Object.keys(AV.E).join(', '));
	
	append_log('load library (checker server-cloud)...');
	AV.ServerCloud = require(GROOT + 'include/ServerCloud.js');
	AV.InputChecker = require(GROOT + 'include/InputChecker.js');
	var types = require(GROOT + 'include/InputChecker.types.js');
	for(var n in types){
		AV.InputChecker.register(n, types[n]);
	}
	
	append_log('load constants...');
	AV.CONSTANTS = require(GENPATH + 'import.jsconst.js');
	
	append_log('load cloudcode...');
	AV.CloudCodeWrapper = require(GROOT + 'include/CloudCodeWrapper.js');
	AV.CallbackList = AV.CloudCodeWrapper.CallbackList;
	
	append_log('load library (controller cloudcode)...');
	AV.ExpressController = require(GROOT + 'include/ExpressController.js');
	require(GROOT + 'include/ExpressController.extra.js');
	
	append_log('load express app...');
	var avosExpressCookieSession = require('avos-express-cookie-session');
	
	append_log('load cloudcode functions...');
	require(GROOT + 'include/global-functions.js');
	
	if(local){
		AV.Cloud.define("__create_inspect", require(GROOT + 'include/InspectCC.js'));
	}
	
	// App 全局配置
	app.use(express.compress());
	app.set('env', local? 'development' : 'production');
	app.set('x-powered-by', false);
	app.set('lib', AV.library);
	app.set('views', 'views');
	app.use(express.bodyParser());
	
	if(fs.existsSync('public/favicon.ico')){
		app.use(require('serve-favicon')('public/favicon.ico'));
	} else if(fs.existsSync(AV.GROOT + 'public_files/favicon.ico')){
		app.use(require('serve-favicon')(AV.GROOT + 'public_files/favicon.ico'));
	}
	
	app.use(express.static(AV.GROOT + 'public_files'));
	
	if(!AV.CONFIG.lean.disableExpress){
		app.use(require('less-middleware')('public'));
	}
	
	if(!AV.CONFIG.lean.disableExpress){
		parse_cookie_session_settings(CONFIG);
		
		app.use(express.cookieParser(CONFIG.cookie.signKey));
		// app.use(express.cookieSession(CONFIG.session));
		app.use(avosExpressCookieSession(CONFIG.avsession));
	}
	
	if(local){
		append_log('load debug client...');
		var debug = require(GROOT + 'include/debug-client.js')(app);
	}
	
	if(!AV.CONFIG.lean.disableExpress){
		append_log('load express smarty template...');
		AV.templatePlugin = require(GROOT + 'include/express-nsmarty-shim.js');
		require(GENPATH + 'import.nsmarty.js').forEach(function (f){
			AV.templatePlugin.parseFile(f);
		});
	}
	
	if(!CONFIG.lean.template || CONFIG.lean.template == 'ejs'){
		app.set('view engine', 'ejs');
	} else if(CONFIG.lean.template == 'smarty'){
		app.set('view engine', '.tpl');
	} else{
		throw new Error("未知模板引擎：" + CONFIG.lean.template);
	}
	
	append_log('load express middlewares...');
	require(GROOT + '/appldr/middlewares.js')(AV, append_log);
	
	append_log('load database define...');
	require(GENPATH + 'import.modules.js');
	
	append_log('detach control...');
	
	var applisten = app.listen;
	app.listen = function (){
		append_log('control re-take...');
		
		append_log('load cloud code define...');
		require(GENPATH + 'import.functions.js');
		
		append_log('load triggers define...');
		require(GENPATH + 'import.triggers.js');
		
		if(!AV.CONFIG.lean.disableExpress){
			append_log('load express routers...');
			require(GENPATH + 'import.express.js');
		}
		
		append_log('load complete turn control to leancloud...');
		end_log();
		
		if(!arguments[0]){
			arguments[0] = {};
		}
		if(!arguments[0].static){
			arguments[0].static = {maxAge: AV.isDebugEnv? 0 : 604800000}
		}
		app.locals['INTERNAL_TEMPLATE'] = AV.INTERNAL_TEMPLATE;
		if(local){
			var debug = require(GROOT + 'include/debug-client.js').debuggerPages(app);
		}
		applisten.apply(app, arguments);
		
		if(!AV.CONFIG.lean.disableExpress){
			var e404Controller;
			if(AV.ExpressController.map['/404']){
				e404Controller = AV.ExpressController.map['/404'];
			} else{
				var e404 = AV.CONFIG.template.notFoundErrorPage;
				e404Controller = require(GROOT + 'include/default404controller.js')(e404);
			}
			app.use(e404Controller.__forceRun.bind(e404Controller));
		}
	};
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
	AV.deploylog = deploylog;
	deploylog = deploylogtimer = undefined;
}
function append_log(msg){
	deploylog += msg + '\n';
	start_log();
}
function parse_cookie_session_settings(CONFIG){
	if(!CONFIG.cookie){
		CONFIG.cookie = {};
	}
	var baseInfo = require('url').parse(CONFIG.baseUrl);
	
	var COOKIE = CONFIG.cookie;
	if(COOKIE.hasOwnProperty('expire')){
		COOKIE.maxAge = COOKIE.expire;
		delete COOKIE.expire;
	} else{
		COOKIE.maxAge = 86400000;
	}
	if(!COOKIE.hasOwnProperty('path')){
		COOKIE.path = baseInfo.pathname || '/';
	}
	if(!COOKIE.hasOwnProperty('domain')){
		COOKIE.domain = baseInfo.hostname || undefined;
	}
	if(!COOKIE.hasOwnProperty('signed')){
		COOKIE.signed = false;
	}
	if(!COOKIE.hasOwnProperty('secure')){
		COOKIE.secure = false;
	}
	if(CONFIG.forceSSL){
		COOKIE.secure = true;
	}
	if(!COOKIE.signKey){
		COOKIE.signKey = 'leang*' + CONFIG.applicationKey;
	}
	
	COOKIE.overwrite = true;
	
	/* SESSION */
	var extend = require('util')._extend;
	if(!CONFIG.session){
		CONFIG.session = {};
	}
	var SESSION = CONFIG.session;
	if(!SESSION.cookie){
		SESSION.cookie = {};
	}
	SESSION.cookie = extend(extend({}, COOKIE), SESSION.cookie);
	SESSION.cookie.httpOnly = true;
	SESSION.cookie.signed = false;
	if(!SESSION.hasOwnProperty('fetchUser')){
		SESSION.fetchUser = false;
	}
	if(!SESSION.hasOwnProperty('key')){
		SESSION.key = 'NODESESSID';
	}
	
	CONFIG.avsession = extend({}, SESSION);
	CONFIG.avsession.key = CONFIG.avsession.userKey || 'AVOSSESSID';
	
	delete SESSION.fetchUser;
}
