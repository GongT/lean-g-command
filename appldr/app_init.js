var fs = require('fs'), path = require('path'), extend = require('util')._extend;
global.appLoaderLog += 'prepare init app...\n';
var AV = global.AV;
var express = AV.express = global._require('express');
var app = AV.server = module.exports = express();

global.appLoaderLog += 'load configure files...\n';
var CONFIG = AV.CONFIG = require('./parse_config');

global.appLoaderLog += 'load fs handler...\n';
var FS = AV.FS = require('../include/FileSystem');

global.appLoaderLog += 'load error handler (remotelogger apierror)...\n';
AV.Logger = require('../include/Logger');
AV.ApiError = require('../include/ApiError');

global.appLoaderLog += 'load lib-loader...\n';
var LibraryLoader = AV.LibraryLoader = require('../include/library_loader');
AV.library = new LibraryLoader;
global.appLoaderLog += '\tread public library folder...\n';
AV.library.autoload(FS.read_source_tree('cloud/library/'));

global.appLoaderLog += 'load database struct...\n';
AV.CLS = require('./databases');

global.appLoaderLog += 'load error code & message...\n';
AV.E = require('./error_message');

global.appLoaderLog += 'load library (checker server-cloud)...\n';
AV.ServerCloud = require('../include/ServerCloud');
AV.InputChecker = require('../include/InputChecker');
var types = require('../include/InputChecker.types');
for(var n in types){
	AV.InputChecker.register(n, types[n]);
}

global.appLoaderLog += 'load constants...\n';
AV.CONSTANTS = require('./create_constants');

global.appLoaderLog += 'load internal library (ExpressController CloudCodeWrapper)...\n';
AV.CloudCodeWrapper = require('../include/CloudCodeWrapper');
AV.CallbackList = AV.CloudCodeWrapper.CallbackList;
AV.ExpressController = require('../include/ExpressController');
require('../include/ExpressController.extra');

global.appLoaderLog += 'load global site functions...\n';
require('../include/global-functions');

if(AV.localhost){
	global.appLoaderLog += '\tregister create inspection fuinction...\n';
	AV.Cloud.define("__create_inspect", require('../include/InspectCC'));
}

// App 全局配置
global.appLoaderLog += 'load express app...\n';
var avosExpressCookieSession = _require('avos-express-cookie-session');
app.use(express.compress());
app.set('env', AV.localhost? 'development' : 'production');
app.set('views', 'views');
app.use(require('less-middleware')(AV.APP_PATH + 'public'));
app.use(express.static(AV.LEANG_PATH + 'public_files'));

if(fs.existsSync(AV.APP_PATH + 'public/favicon.ico')){
	app.use(require('serve-favicon')(AV.APP_PATH + 'public/favicon.ico'));
} else if(fs.existsSync(AV.LEANG_PATH + 'public_files/favicon.ico')){
	app.use(require('serve-favicon')(AV.LEANG_PATH + 'public_files/favicon.ico'));
}

app.use(express.bodyParser());
app.use(express.cookieParser(CONFIG.cookie.signKey));
// app.use(express.cookieSession(CONFIG.session));
app.use(avosExpressCookieSession(CONFIG.avsession));

if(AV.localhost){
	global.appLoaderLog += 'load debug client...\n';
	var debug = require('../include/debug-client')(app);
}

global.appLoaderLog += 'load express smarty template...\n';
AV.templatePlugin = require('../include/express-nsmarty-shim');

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
	require('./cloud_code_functions');
	
	global.appLoaderLog += 'load triggers define...\n';
	require('./database_triggers');
	
	global.appLoaderLog += 'load express routers...\n';
	require('./controlers');
	
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
	
	var e404Controller;
	if(AV.ExpressController.map['/404']){
		e404Controller = AV.ExpressController.map['/404'];
	} else{
		var e404 = AV.CONFIG.template.notFoundErrorPage;
		e404Controller = require('../include/default404controller')(e404);
	}
	app.use(e404Controller.__forceRun.bind(e404Controller));
};

module.exports = app;
