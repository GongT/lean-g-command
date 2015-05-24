var fs = require('fs'), path = require('path'), extend = require('util')._extend;
var AV = global.AV;
var express = AV.express = global._require('express');
var app = AV.server = module.exports = express();

global.appLoaderLog += 'load config...\n';
var CONFIG = AV.CONFIG = require(AV.GEN_PATH + 'config');
AV.isDebugEnv = CONFIG.isDebugEnv;
AV.isTestEnv = CONFIG.isTestEnv;
if(!AV.CONFIG.template){
	AV.CONFIG.template = {};
}
if(!AV.CONFIG.template.standardErrorPage){
	AV.CONFIG.template.standardErrorPage = AV.INTERNAL_TEMPLATE_PATH + 'error_page/standard_error.tpl';
}
if(!AV.CONFIG.template.internalErrorPage){
	AV.CONFIG.template.internalErrorPage = AV.INTERNAL_TEMPLATE_PATH + 'error_page/internal_error.tpl';
}
if(!AV.CONFIG.template.userErrorPage){
	AV.CONFIG.template.userErrorPage = AV.INTERNAL_TEMPLATE_PATH + 'error_page/user_error.tpl';
}
if(!AV.CONFIG.template.notFoundErrorPage){
	AV.CONFIG.template.notFoundErrorPage = AV.INTERNAL_TEMPLATE_PATH + 'error_page/404_not_found.tpl';
}

var FS = AV.FS = require('../include/FileSystem');

global.appLoaderLog += 'load error handler (remotelogger apierror)...\n';
AV.Logger = require('../include/Logger');
AV.ApiError = require('../include/ApiError');

global.appLoaderLog += 'load library (libload prototype)...\n';
var LibraryLoader = AV.LibraryLoader = require('../include/library_loader');
AV.library = new LibraryLoader;
AV.library.autoload(FS.read_source_tree('cloud/library/'));

AV.CLS = require('./databases');

AV.E = require('./error_message');

global.appLoaderLog += 'load library (checker server-cloud)...\n';
AV.ServerCloud = require('../include/ServerCloud');
AV.InputChecker = require('../include/InputChecker');
var types = require('../include/InputChecker.types');
for(var n in types){
	AV.InputChecker.register(n, types[n]);
}

global.appLoaderLog += 'load constants...\n';
AV.CONSTANTS = require(AV.GEN_PATH + 'import.jsconst');

global.appLoaderLog += 'load cloudcode...\n';
AV.CloudCodeWrapper = require('../include/CloudCodeWrapper');
AV.CallbackList = AV.CloudCodeWrapper.CallbackList;

global.appLoaderLog += 'load library (controller cloudcode)...\n';
AV.ExpressController = require('../include/ExpressController');
require('../include/ExpressController.extra');

global.appLoaderLog += 'load express app...\n';
var avosExpressCookieSession = _require('avos-express-cookie-session');

global.appLoaderLog += 'load cloudcode functions...\n';
require('../include/global-functions');

if(AV.localhost){
	AV.Cloud.define("__create_inspect", require('../include/InspectCC'));
}

// App 全局配置
app.use(express.compress());
app.set('env', AV.localhost? 'development' : 'production');
app.set('x-powered-by', false);
app.set('lib', AV.library);
app.set('views', 'views');
app.use(express.bodyParser());

if(fs.existsSync('public/favicon.ico')){
	app.use(require('serve-favicon')('public/favicon.ico'));
} else if(fs.existsSync(AV.LEANG_PATH + 'public_files/favicon.ico')){
	app.use(require('serve-favicon')(AV.LEANG_PATH + 'public_files/favicon.ico'));
}

app.use(express.static(AV.LEANG_PATH + 'public_files'));

if(!AV.CONFIG.lean.disableExpress){
	app.use(require('less-middleware')('public'));
}

if(!AV.CONFIG.lean.disableExpress){
	parse_cookie_session_settings(CONFIG);
	
	app.use(express.cookieParser(CONFIG.cookie.signKey));
	// app.use(express.cookieSession(CONFIG.session));
	app.use(avosExpressCookieSession(CONFIG.avsession));
}

if(AV.localhost){
	global.appLoaderLog += 'load debug client...\n';
	var debug = require('../include/debug-client')(app);
}

if(!AV.CONFIG.lean.disableExpress){
	global.appLoaderLog += 'load express smarty template...\n';
	AV.templatePlugin = require('../include/express-nsmarty-shim');
	AV.templatePlugin.loadViewFunctions(AV.APP_PATH, AV.LEANG_PATH);
}

if(!CONFIG.lean.template || CONFIG.lean.template == 'ejs'){
	app.set('view engine', 'ejs');
} else if(CONFIG.lean.template == 'smarty'){
	app.set('view engine', '.tpl');
} else{
	throw new Error("未知模板引擎：" + CONFIG.lean.template);
}

global.appLoaderLog += 'load express middlewares...\n';
require('./middlewares');

global.appLoaderLog += 'load database define...\n';
AV.CLS.parseDatabaseDefine();

global.appLoaderLog += 'detach control...\n';

var applisten = app.listen;
app.listen = function (){
	global.appLoaderLog += 'control re-take...\n';
	
	global.appLoaderLog += 'load cloud code define...\n';
	require(AV.GEN_PATH + 'import.functions');
	
	global.appLoaderLog += 'load triggers define...\n';
	require(AV.GEN_PATH + 'import.triggers');
	
	if(!AV.CONFIG.lean.disableExpress){
		global.appLoaderLog += 'load express routers...\n';
		require(AV.GEN_PATH + 'import.express');
	}
	
	global.appLoaderLog += 'load complete turn control to leancloud...\n';
	
	if(!arguments[0]){
		arguments[0] = {};
	}
	if(!arguments[0].static){
		arguments[0].static = {maxAge: AV.isDebugEnv? 0 : 604800000}
	}
	app.locals['INTERNAL_TEMPLATE_PATH'] = AV.INTERNAL_TEMPLATE_PATH;
	if(AV.localhost){
		var debug = require('../include/debug-client').debuggerPages(app);
	}
	applisten.apply(app, arguments);
	
	if(!AV.CONFIG.lean.disableExpress){
		var e404Controller;
		if(AV.ExpressController.map['/404']){
			e404Controller = AV.ExpressController.map['/404'];
		} else{
			var e404 = AV.CONFIG.template.notFoundErrorPage;
			e404Controller = require('../include/default404controller')(e404);
		}
		app.use(e404Controller.__forceRun.bind(e404Controller));
	}
};

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
